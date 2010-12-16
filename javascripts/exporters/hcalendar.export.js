function parseISO(isoString) {
  var d       = isoString.match(/(\d{4})(-?(\d{2})(-?(\d{2})((T|\s)(\d{2}):?(\d{2})(:?(\d{2})([.]?(\d+))?)?(Z|(([+-])(\d{2}):?(\d{2}))?)?)?)?)?/);
  
  var theDate = new Date(d[1], 0, 1);
  
  // <month> - 1:  Because JS months are 0-11
  if (d[ 3]) { theDate.setMonth(  d[ 3] - 1); }
  if (d[ 5]) { theDate.setDate(   d[ 5]); }
  if (d[ 8]) { theDate.setHours(  d[ 8]); }
  if (d[ 9]) { theDate.setMinutes(d[ 9]); }
  if (d[11]) { theDate.setSeconds(d[11]); }
  // Must be between 0 and 999), using Paul Sowden's method: http://delete.me.uk/2005/03/iso8601.html
  if (d[13]) { theDate.setMilliseconds(Number("0." + d[13]) * 1000); }
  var offset = 0;
  if (d[16]) {
      var offset = (Number(d[17])*60 + Number(d[18])) * 60;
      if (d[16] == "+") { offset *= -1; }
  }
  
  offset -= theDate.getTimezoneOffset() * 60;
  theDate.setTime(Number(theDate) + (offset * 1000));
  return theDate;
};


Export.HCalendar = {   
   // <entry xmlns='http://www.w3.org/2005/Atom'
   //     xmlns:gd='http://schemas.google.com/g/2005'>
   //   <category scheme='http://schemas.google.com/g/2005#kind'
   //     term='http://schemas.google.com/g/2005#event'></category>
   //   <title type='text'>Tennis with Beth</title>
   //   <content type='text'>Meet for a quick lesson.</content>
   //   <gd:transparency value='http://schemas.google.com/g/2005#event.opaque'></gd:transparency>
   //   <gd:eventStatus value='http://schemas.google.com/g/2005#event.confirmed'></gd:eventStatus>
   //   <gd:where valueString='Rolling Lawn Courts'></gd:where>
   //   <gd:when startTime='2006-04-17T15:00:00.000Z' endTime='2006-04-17T17:00:00.000Z'></gd:when>
   // </entry>

  google: function(calendar, callback) {
    if (!calendar.summary || !calendar.dtstart) {
      throw new Error('Events must have a summary and a start date ');
    }
    
    // Make sure the user is logged in 
    if (!oauth.hasToken()) {
      throw new Error('You must be logged in');
    }
    
    // Create the XML document to send to Google
    var stdXML = "<entry xmlns='http://www.w3.org/2005/Atom' xmlns:gd='http://schemas.google.com/g/2005'>"
                 + "<category scheme='http://schemas.google.com/g/2005#kind' term='http://schemas.google.com/contact/2008#event' />"
               + "</entry>";
               
    var sendURL = 'https://www.google.com/calendar/feeds/default/private/full';

    var parser = new DOMParser();
    
    // var xml can be used as a DOM document
    var xml = parser.parseFromString(stdXML, "text/xml");
    var root = xml.firstChild;

    var title = xml.createElement('title');
    title.appendChild(xml.createTextNode(calendar.summary));
    root.appendChild(title);
    
    var desc = xml.createElement('content');
    desc.appendChild(xml.createTextNode(calendar.description));
    root.appendChild(desc);

    var transparency = xml.createElement('gd:transparency');
    transparency.setAttribute("value", "http://schemas.google.com/g/2005#event.opaque");
    root.appendChild(transparency);
    
    var status = xml.createElement('gd:eventStatus');
    status.setAttribute("value","http://schemas.google.com/g/2005#event.confirmed");
    root.appendChild(status);
    
    var where = xml.createElement('gd:where');
    where.setAttribute('valueString', calendar.location);
    root.appendChild(where);
    
    var when = xml.createElement('gd:when');
    when.setAttribute('startTime', parseISO(calendar.dtstart).toISOString());
    if (calendar.dtend) {
      when.setAttribute('endTime', parseISO(calendar.dtend).toISOString());
    }
    root.appendChild(when);

    var Serializer = new XMLSerializer();
    
    // Now that everything is set, send it to Google Calendar!
    oauth.sendSignedRequest(sendURL, callback, {
      'method': 'POST',
      'headers': {
        'GData-Version': '2.0',
        'Content-Type': 'application/atom+xml'
      },
      'body': Serializer.serializeToString(xml)
    });
  }
};