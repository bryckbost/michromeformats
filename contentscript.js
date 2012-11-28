function discoverMicroformats() {
  var hcards      = ufShiv.get('hCard', document.body)['microformats']['vcard'];
  var hcalendars  = ufShiv.get('hCalendar', document.body)['microformats']['vevent'];
  var hreviews    = ufShiv.get('hReview', document.body)['microformats']['hreview'];
  var hreviewaggs = HReviewAggregate.discover();
  var hrecipes    = HRecipe.discover();
  var geos        = ufShiv.get('geo', document.body)['microformats']['geo'];

  // convert objects into JSON so we can
  // pass the arrays to the background page
  for(i = 0; i < hcards.length; i++) {
    hcards[i] = JSON.stringify(hcards[i]);
  }
  for(i = 0; i < hcalendars.length; i++) {
    hcalendars[i] = JSON.stringify(hcalendars[i]);
  }
  for(i = 0; i < hreviews.length; i++) {
    var zz = JSON.stringify(hreviews[i]);
    hreviews[i] = zz;
  }
  for(i = 0; i < hreviewaggs.length; i++) {
    var yy = JSON.stringify(hreviewaggs[i]);
    hreviewaggs[i] = yy;
  }
  for(i = 0; i < hrecipes.length; i++) {
    hrecipes[i] = JSON.stringify(hrecipes[i]);
  }
  for(i = 0; i < geos.length; i++) {
    geos[i] = JSON.stringify(geos[i]);
  }

  chrome.extension.sendMessage({hcards: hcards, hcalendars: hcalendars, hreviews: hreviews, hreviewaggs: hreviewaggs, hrecipes: hrecipes, geos: geos});
}

discoverMicroformats();

