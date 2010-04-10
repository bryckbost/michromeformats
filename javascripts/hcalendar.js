HCalendar = Microformat.define('vevent', {
  one : ['class', 'description', 'dtend', 'dtstamp', 'dtstart', 'duration',
         'location', 'status', 'summary', 'uid', 'last-modified', { 'url' : 'url' }],
  many : ['category']
});
