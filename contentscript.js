discoverMicroformats();

function discoverMicroformats() {
	var hcards = HCard.discover();
  var hcalendars = HCalendar.discover();
  var hreviews = HReview.discover();

  // convert objects into JSON so we can
  // pass the arrays to the background page
  for(i = 0; i < hcards.length; i++) {
    hcards[i] = JSON.stringify(hcards[i]);
  }
  for(i = 0; i < hcalendars.length; i++) {
    hcalendars[i] = JSON.stringify(hcalendars[i]);
  }
  for(i = 0; i < hreviews.length; i++) {
    hreviews[i] = JSON.stringify(hreviews[i]);
  }

  chrome.extension.sendRequest({hcards: hcards, hcalendars: hcalendars, hreviews: hreviews});
}

