discover_microformats();

function discover_microformats() {
	var hcards = HCard.discover();
  var hcalendars = HCalendar.discover();
  var hreviews = HReview.discover();
	
	if(hcards.length > 0 || hcalendars.length > 0 || hreviews.length > 0) {
		chrome.extension.sendRequest({hcards: hcards});
    chrome.extension.sendRequest({hcalendars: hcalendars});
    chrome.extension.sendRequest({hreviews: hreviews});
	}
}
