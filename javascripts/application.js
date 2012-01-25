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