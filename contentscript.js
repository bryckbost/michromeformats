// The background page is asking us to find a microformat on the page.
if (window == top) {
  chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
    sendResponse(discover_microformats());
  });
}

var discover_microformats = function() {
	var hcards = HCard.discover();
  var hcalendars = HCalendar.discover();
  var hreviews = HReview.discover();
  
  console.log('hcards: ' + hcards.length);
  console.log('hcalendars: ' + hcalendars.length);
  console.log('hreviews: ' + hreviews.length);
};
