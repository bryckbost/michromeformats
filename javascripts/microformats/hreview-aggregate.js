HReviewAggregate = Microformat.define('hreview-aggregate', {
  one : ['rating', 'count', 'votes', 'summary', {
    item : { one : ['fn', {'url' : 'url', 'photo':'url'}] }
  }]
});