var Geo = Microformat.define('geo', {
  one : [ { 
    'latitude' : function(node) {
      var m;
      if ((node.nodeName.toLowerCase() == 'abbr') && (m = node.title.match(/^([\-\d\.]+);([\-\d\.]+)$/))) {
        return { latitude : m[1] };
      }
    
      return this._extractSimple(node);
    },
    'longitude' : function(node) {
      var m;
      if ((node.nodeName.toLowerCase() == 'abbr') && (m = node.title.match(/^([\-\d\.]+);([\-\d\.]+)$/))) {
        return { longitude : m[2] };
      }
    
      return this._extractSimple(node);
    }}
  ]
});
