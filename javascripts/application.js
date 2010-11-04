function unique_cards(array) {
  var a = [], l = array.length;
  for(var i = 0; i < l; i++) {
      for(var j = i+1; j < l; j++) {
        if (array[i].fn === array[j].fn) {
          j = ++i;
        }
      }
      a.push(array[i]);
  }
  return a;
}

function unique_events(array) {
  var a = [], l = array.length;
  for(var i = 0; i < l; i++) {
      for(var j = i+1; j < l; j++) {
        if (array[i].summary === array[j].summary && array[i].dtstart === array[j].dtstart) {
          j = ++i;
        }
      }
      a.push(array[i]);
  }
  return a;
}

function unique_geos(array) {
  var a = [], l = array.length;
  for(var i = 0; i < l; i++) {
      for(var j = i+1; j < l; j++) {
        if (array[i].latitude === array[j].latitude && array[i].longitude === array[j].longitude) {
          j = ++i;
        }
      }
      a.push(array[i]);
  }
  return a;
}