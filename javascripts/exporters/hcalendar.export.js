Export.HCalendar = {
  
  /** 
   * Will send a vEvent to Google
   * This is quite easy since you can send JSON-C using Protocol v2.0
   * A typical JSON structure for adding an event is:
   * {
   *   "data": {
   *     "title": "Tennis with Beth",
   *     "details": "Meet for a quick lesson.",
   *     "location": "Rolling Lawn Courts",
   *     "when": [{
   *       "start": "2010-04-17T15:00:00.000Z",
   *       "end": "2010-04-17T17:00:00.000Z"
   *     }]
   *   }
   * }
   */
  google: function( calendar, callback ){
    if( !calendar.summary || !calendar.dtstart ){
      throw new Error( 'Events must have a summary and a start date ' );
    }
    
    // Make sure the user is logged in 
    if( !oauth.hasToken() ){
      throw new Error( 'You must be logged in' );
    }
    
    var sendURL = 'https://www.google.com/calendar/feeds/default/private/full';
    
    // vEvent is the object that will be sent as JSON to Google
    var vEvent = { data: {} };
    
    // Set the title
    vEvent.data.title = calendar.summary;
    
    // Set start date/time
    vEvent.data.when = [{}];
    vEvent.data.when[0].start = calendar.dtstart;
    
    // Set date end/time
    if( calendar.dtend ){
      vEvent.data.when[0].end = calendar.dtend;
    }
    
    // Set details
    if( calendar.description ){
      vEvent.data.details = calendar.description;
    }
    
    // Set the location
    if( calendar.location ){
      vEvent.data.location = calendar.location;
    }
    
    // Now that everything is set, send it to Google Calendar!
    oauth.sendSignedRequest(sendURL, callback, {
      'method': 'POST',
      'headers': {
        'GData-Version': '2',
        'Content-Type': 'application/json'
      },
      'parameters': {'alt': 'jsonc'},
      'body': JSON.stringify( vEvent )
    });
  }
};