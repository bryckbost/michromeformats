// Generic Microformat Parser v0.1 Dan Webb (dan@danwebb.net)
// Licenced under the MIT Licence
// 
// var people = HCard.discover();
// people[0].fn => 'Dan Webb'
// people[0].urlList => ['http://danwebb.net', 'http://eventwax.com']
//
// TODO
//
// Fix _propFor to work with old safari
// Find and use unit testing framework on microformats.org test cases
// isue with hcard email?
// More formats: HFeed, HEntry, HAtom, RelTag, XFN?


// JavaScript 1.6 Iterators and generics cross-browser
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(func, scope) {
    scope = scope || this;
    for (var i = 0, l = this.length; i < l; i++)
      func.call(scope, this[i], i, this); 
  }
}

if (typeof Prototype != 'undefined' || !Array.prototype.map) {
  Array.prototype.map = function(func, scope) {
    scope = scope || this;
    var list = [];
    for (var i = 0, l = this.length; i < l; i++)
        list.push(func.call(scope, this[i], i, this)); 
    return list;
  }
}

if (typeof Prototype != 'undefined' || !Array.prototype.filter) {
  Array.prototype.filter = function(func, scope) {
    scope = scope || this;
    var list = [];
    for (var i = 0, l = this.length; i < l; i++)
        if (func.call(scope, this[i], i, this)) list.push(this[i]); 
    return list;
  }
}

['forEach', 'map', 'filter', 'slice', 'concat'].forEach(function(func) {
    if (!Array[func]) Array[func] = function(object) {
      return this.prototype[func].apply(object, Array.prototype.slice.call(arguments, 1));
    }
});

// ISO8601 Date extension
Date.ISO8601PartMap = {
  Year : 1,
  Month : 2,
  Date : 3,
  Hours : 4,
  Minutes : 5,
  Seconds : 6,
  Milliseconds: 7
}

Date.matchISO8601 = function(text) { 
  return text.match(/^(\d{4})(?:-?(\d{2})(?:-?(\d{2})(?:T(\d{2}):?(\d{2})(?::?(\d{2})(?:[.]?(\d+))?)?(?:Z|(?:([+-])(\d{2}):?(\d{2}))?)?)?)?)?$/);
}

Date.parseISO8601 = function(text) {
  var dateParts = this.matchISO8601(text);
  if (dateParts) {
    var date = new Date, parts, offset = 0;
    for (var prop in this.ISO8601PartMap) {
      if (part = dateParts[this.ISO8601PartMap[prop]]) 
        date['set' + prop]((prop == 'Month') ? parseInt(part)-1 : parseInt(part));
        else date['set' + prop]((prop == 'Date') ? 1 : 0);
    }
    
    if (dateParts[11]) {
      offset = (parseInt(dateParts[14]) * 60) + parseInt(dateParts[15]);
      offset *= ((parseInt[13] == '-') ? 1 : -1);
    }
    
    offset -= date.getTimezoneOffset();
    date.setTime(date.getTime() + (offset * 60 * 1000)); 
    
    return date;
  }
}

// Main Microformat namespace
Microformat = {
  define : function(name, spec) {
    var mf = function(node, data) {
      this.parentElement = node;
      Microformat.extend(this, data);
    };
    
    mf.container = name;
    mf.format = spec;
    mf.prototype = Microformat.Base;
    return Microformat.extend(mf, Microformat.SingletonMethods);
  },
  SingletonMethods : {
    discover : function(context) {
      return Microformat.$$(this.container, context).map(function(node) {
        return new this(node, this._parse(this.format, node));
      }, this);
    },
    _parse : function(format, node) {
      var data = {};
      this._process(data, format.one, node, true);
      this._process(data, format.many, node);
      return data;
    },
    _process : function(data, format, context, firstOnly) {
      var selection, first;
      format = format || [];
      format.forEach(function(item) {
        if (typeof item == 'string') {
          selection = Microformat.$$(item, context);
          
          if (firstOnly && (first = selection[0])) {
            data[this._propFor(item)] = this._extractData(first, 'simple', data);
          } else if (selection.length > 0) {
            data[this._propFor(item) + 'List'] = selection.map(function(node) {
              return this._extractData(node, 'simple', data);
            }, this);
          }
            
        } else {
          
            for (var cls in item) {
              selection = Microformat.$$(cls, context);
              
              if (firstOnly && (first = selection[0])) {
                data[this._propFor(cls)] = this._extractData(first, item[cls], data);
              } else if (selection.length > 0) {
                data[this._propFor(cls + 'List')] = selection.map(function(node) {
                  return this._extractData(node, item[cls], data);
                }, this);
              }
            }
              
        }
        
      }, this);
      return data;
    },
    _extractData : function(node, dataType, data) {
      if (dataType._parse) return dataType._parse(dataType.format, node);
      if (typeof dataType == 'function') return dataType.call(this, node, data);
      
      var values = Microformat.$$('value', node);
      if (values.length > 0) return this._extractClassValues(node, values);
      
      switch (dataType) {
        case 'simple': return this._extractSimple(node);
        case 'url': return this._extractURL(node);
      }
      return this._parse(dataType, node);
    },
    _extractURL : function(node) {
      var href;
      switch (node.nodeName.toLowerCase()) {
        case 'img':    href = node.src;
                       break;
        case 'area':
        case 'a':      href = node.href;
                       break;
        case 'object': href = node.data;
      }
      if (href) {
        if (href.indexOf('mailto:') == 0) 
          href = href.replace(/^mailto:/, '').replace(/\?.*$/, '');
        return href;
      }
      
      return this._coerce(this._getText(node));
    },
    _extractSimple : function(node) {
      switch (node.nodeName.toLowerCase()) {
        case 'abbr': return this._coerce(node.title);
        case 'img': return this._coerce(node.alt);
      }
      return this._coerce(this._getText(node));
    },
    _extractClassValues : function(node, values) {
      var value = new String(values.map(function(value) {
        return this._extractSimple(value);
      }, this).join(''));
      var types = Microformat.$$('type', node);
      var t = types.map(function(type) {
        return this._extractSimple(type);
      }, this);
      value.types = t;
      return value;
    },
    _getText : function(node) {
      if (node.innerText) return node.innerText;
      return Array.map(node.childNodes, function(node) {
        if (node.nodeType == 3) return node.nodeValue;
        else return this._getText(node);
      }, this).join('').replace(/\s+/g, ' ').replace(/(^\s+)|(\s+)$/g, '');
    },
    _coerce : function(value) {
      var date, number;
      if (value == 'true') return true;
      if (value == 'false') return false;
      if (date = Date.parseISO8601(value)) return date;
      return String(value);
    },
    _propFor : function(name) {
      this.__propCache = this.__propCache || {};
      if (prop = this.__propCache[name]) return prop;
      return this.__propCache[name] = name.replace(/(-(.))/g, function() {
        // this isn't going to work on old safari without the fix....hmmm
        return arguments[2].toUpperCase();
      });
    },
    _handle : function(prop, item, data) {
      if (this.handlers[prop]) this.handlers[prop].call(this, item, data);
    }
  },
  // In built getElementsByClassName
  $$ : function(className, context) {
    if (typeof Sizzle == 'function') {
      return Sizzle('.'+className, context);
    } else if (typeof Selector == 'function') {
      return Selector.findChildElements(context, $A(['.'+className]));
    } else if (typeof jQuery == 'function') {
      return jQuery('.'+className, context)
    } else {
      context = context || document;
      var nodeList;
      
      if (context == document || context.nodeType == 1) {
        if (typeof document.evaluate == 'function') {
          var xpath = document.evaluate(".//*[contains(concat(' ', @class, ' '), ' " + className + " ')]", 
                                        context, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
          var els = [];
          for (var i = 0, l = xpath.snapshotLength; i < l; i++)
           els.push(xpath.snapshotItem(i));
          return els;
        } else nodeList = context.getElementsByTagName('*');
      } else nodeList = context;
      
      var re = new RegExp('(^|\\s)' + className + '(\\s|$)');
      return Array.filter(nodeList, function(node) {  return node.className.match(re) });
    }
  },
  // In built Object.extend equivilent
  extend : function(dest, source) {
    for (var prop in source) dest[prop] = source[prop];
    return dest;
  },
  // methods available to all instances of a microformat
  Base : {}
};
