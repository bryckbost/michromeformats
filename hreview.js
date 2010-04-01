HReview = Microformat.define('hreview', {
  one : ['version', 'summary', 'type', 'dtreviewed', 'rating', 'description', { 'reviewer' : HCard }, {
    item : { one : ['fn'] }
  }]
});