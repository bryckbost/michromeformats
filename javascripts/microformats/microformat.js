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

Microformat = {
  define: function (name, spec) {
    var mf = function (node, data) {
      Microformat.extend(this, data);
    };
    mf.container = name;
    mf.format = spec;
    mf.prototype = Microformat.Base;
    return Microformat.extend(mf, Microformat.SingletonMethods);
  },
  SingletonMethods: {
    discover: function (context) {
      return Microformat.$$(this.container, context).map(function (node) {
        return new this(node, this._parse(this.format, node));
      }, this);
    },
    _parse: function (format, node) {
      var data = {};
      this._process(data, format.one, node, true);
      this._process(data, format.many, node);
      return data;
    },
    _process: function (data, format, context, firstOnly) {
      var selection, first;
      format = format || [];
      format.forEach(function (item) {
        if (typeof item == 'string') {
          selection = Microformat.$$(item, context);
          if (firstOnly && (first = selection[0])) {
            data[this._propFor(item)] = this._extractData(first, 'simple', data);
          } else if (selection.length > 0) {
            data[this._propFor(item)] = selection.map(function (node) {
              return this._extractData(node, 'simple', data);
            }, this);
          }
        } else {
          for (var cls in item) {
            selection = Microformat.$$(cls, context);
            if (firstOnly && (first = selection[0])) {
              data[this._propFor(cls)] = this._extractData(first, item[cls], data);
            } else if (selection.length > 0) {
              data[this._propFor(cls)] = selection.map(function (node) {
                return this._extractData(node, item[cls], data);
              }, this);
            }
          }
        }
      }, this);
      return data;
    },
    _extractData: function (node, dataType, data) {
      if (dataType._parse) return dataType._parse(dataType.format, node);
      if (typeof dataType == 'function') return dataType.call(this, node, data);
      var values = Microformat.$$('value', node);
      if (values.length > 0) return this._extractClassValues(node, values);
      switch (dataType) {
      case 'simple':
        return this._extractSimple(node);
      case 'url':
        return this._extractURL(node);
      }
      return this._parse(dataType, node);
    },
    _extractURL: function (node) {
      var href;
      switch (node.nodeName.toLowerCase()) {
      case 'img':
        href = node.src;
        break;
      case 'area':
      case 'a':
        href = node.href;
        break;
      case 'object':
        href = node.data;
      }
      if (href) {
        if (href.indexOf('mailto:') == 0) href = href.replace(/^mailto:/, '').replace(/\?.*$/, '');
        return href;
      }
      return this._coerce(this._getText(node));
    },
    _extractSimple: function (node) {
      switch (node.nodeName.toLowerCase()) {
      case 'abbr':
        return this._coerce(node.title);
      case 'img':
        return this._coerce(node.alt);
      }
      return this._coerce(this._getText(node));
    },
    _extractClassValues: function (node, values) {
      var value = new String(values.map(function (value) {
        return this._extractSimple(value);
      }, this).join(''));
      var types = Microformat.$$('type', node);
      var t = types.map(function (type) {
        return this._extractSimple(type);
      }, this);
      value.types = t;
      return value;
    },
    _getText: function (node) {
      if (node.textContent) return node.textContent;
      return Array.map(node.childNodes, function (node) {
        if (node.nodeType == 3) return node.nodeValue;
        else return this._getText(node);
      }, this).join('').replace(/\s+/g, ' ').replace(/(^\s+)|(\s+)$/g, '');
    },
    _coerce: function (value) {
      var date, number;
      if (value == 'true') return true;
      if (value == 'false') return false;
      return String(value);
    },
    _propFor: function (name) {
      this.__propCache = this.__propCache || {};
      if (prop = this.__propCache[name]) return prop;
      return this.__propCache[name] = name;
    },
    _handle: function (prop, item, data) {
      if (this.handlers[prop]) this.handlers[prop].call(this, item, data);
    }
  },
  $$: function (className, context) {
    context = context || document;
    var nodeList;
    if (context == document || context.nodeType == 1) {
      if (typeof document.evaluate == 'function') {
        var xpath = document.evaluate(".//*[contains(concat(' ', @class, ' '), ' " + className + " ')]", context, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        var els = [];
        for (var i = 0, l = xpath.snapshotLength; i < l; i++)
        els.push(xpath.snapshotItem(i));
        return els;
      } else nodeList = context.getElementsByTagName('*');
    } else nodeList = context;
    var re = new RegExp('(^|\\s)' + className + '(\\s|$)');
    return Array.filter(nodeList, function (node) {
      return node.className.match(re)
    });
  },
  extend: function (dest, source) {
    for (var prop in source) dest[prop] = source[prop];
    return dest;
  },
  Base: {}
};