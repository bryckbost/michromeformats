findMicroformats();

function findMicroformats() {
	var hCards = HCard.discover();
	for(i = 0; i < hCards.length; i++) {
		hCards[i].n = JSON.stringify(hCards[i].n);
		hCards[i] = JSON.stringify(hCards[i]);
	}
	if(hCards.length > 0)
		chrome.extension.sendRequest({hCards: hCards});
}
