// Copyright (c) 2010 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// The possible log levels.
var logLevels = {
    "none": 0,
    "error": 1,
    "info": 2
};

// Defines the current log level. Values other than "none" are for debugging
// only and should at no point be checked in.
var currentLogLevel = logLevels.info;

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
