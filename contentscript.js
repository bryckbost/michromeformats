findMicroformats();

function findMicroformats() {
	var hCards = HCard.discover();
	var hCalendars = HCalendar.discover();
	var hReviews = HReview.discover();
	
	if(hCards.length > 0 || hCalendars.length > 0 || hReviews.length > 0) {
		chrome.extension.sendRequest({hCards: hCards});
		chrome.extension.sendRequest({hCalendars: hCalendars});
		chrome.extension.sendRequest({hReviews: hReviews});
	}

}
