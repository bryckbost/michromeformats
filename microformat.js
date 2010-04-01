/*
  @author: remy sharp
  @info: http://leftlogic.com/lounge/articles/microformats_bookmarklet/
  @date: 2007-10-22
  @license: Creative Commons License - ShareAlike http://creativecommons.org/licenses/by-sa/3.0/

  Load by (using graceful wait for prerequsite library):
javascript:(function(){function%20l(u,i,t,b){var%20d=document;if(!d.getElementById(i)){var s=d.createElement('script');s.src=u;s.id=i;d.body.appendChild(s)}s=setInterval(function(){u=0;try{u=t.call()}catch(i){}if(u){clearInterval(s);b.call()}},200)}l('http://leftlogic.com/js/microformats.js','MF_loader',function(){return!!(typeof MicroformatsBookmarklet=='function')}, function(){MicroformatsBookmarklet()})})();
*/
function MicroformatsBookmarklet() {
    // load jQuery
    
    var jqe = null;
    var run_once = 0;
    var found = 0;
    var photoguid = 0;
    var photocomplete = [];
    var nl = '%0D%0A'; // %0D%0A = nl! yay!


    $j = jQuery.noConflict();

    var hCard = function(hc) {
    	found++; // flag we've got one
    	var hCard = {}, keys = [], i, kv, n;

    	keys = ['fn', 'n', 'org', 'title', 'role', 'note', 'family-name', 'given-name', 'additional-name', 'honorific-prefix', 'honorific-suffix', 'nickname', 'category', 'note'];
    	for (i = 0; i < keys.length; i++) {
    	    kv = $j('.' + keys[i], hc)
    		if (kv.length) {
    		    hCard[keys[i]] = cleanString(kv[0].title ? kv[0].title : kv.text(), true);
    		}
    	}

    	// collect adr manually
    	if ($j('.adr', hc).length) {
    		keys = ['post-office-box', 'extended-address', 'street-address', 'locality', 'region', 'postal-code', 'country-name'];

    		for (i = 0; i < keys.length; i++) {
    		    kv = $j('.' + keys[i], hc);
    			if (kv.length) hCard[keys[i]] = cleanString(kv.text());
    			hCard.adr = 1;
    		}
    	}

    	hCard.tel = {};
    	$j('.tel', hc).each(function() {
    		var t = $j('.type', this); // should also check the class of $j(this)
    		if (!t.length) t = $j(this);

    		if (t.length && t.attr('title')) {
    		    t = t.attr('title'); // non-standard...?
    		} else if (t.text()) {
    		    t = t.text();
    		} else {
    		    t = 'Work';
    		}

    		var v = $j('.value', this).text();
    		if (!v) v = $j(this).text();

    		hCard.tel[t] = v;
    	});

    	// attribute based values
    	if ($j('.url', hc).length) hCard.url = $j('.url', hc).attr('href');
    	if ($j('.email', hc).length) hCard.email = $j('.email', hc).attr('href');
    	if ($j('.bday', hc).length) hCard.bday = $j('.bday', hc).attr('title');

    	// clean up
    	if (hCard.email) hCard.email = cleanEmail(hCard.email);
    	if (hCard.url) hCard.url = cleanURL(hCard.url);

    	if (hCard.note) hCard.note = hCard.note.replace(/\n/g, '\\n');
    	var note = 'Source: ' + location.hostname;
    	if (hCard.note) {
    	    hCard.note += '\\n' + note;
    	} else {
    	    hCard.note = note;  
    	} 

    	if (!hCard.fn && hCard.org) hCard.fn = hCard.org;
    	
    	/** 
    	* going against this - because if only fn is provided as 'Remy Sharp',
    	* then n becomes 'Remy' which will be the only field I see in the contact
    	* imported.  Therefore, copying the fn directly across.
    	*/ 
    	// http://microformats.org/wiki/hcard#Implied_.22n.22_Optimization
    	if (!hCard.n) n = hCard.fn;

    	this.log = function () {
    		console.log('hCard', hCard.fn, hCard.email, hCard.url, hCard.n);
    	};

    	this.show = function() {
    	     // damn google maps for adding hCards with fns
    	    if (!hCard.fn) {
    	        found--;
    	        return;
    	    }
    		var html = '<div class="MF_card MF_vcard">';
    		html += '<p class="MF_header"><a href="' + this.asDownload() + '" title="Add to address book">' + hCard.fn + '</a></p>';
    		if (hCard.email) html += '<p class="MF_detail">' + hCard.email + '</p>';
    		if (hCard.url) html += '<p class="MF_detail">' + hCard.url + '</p>';
    		if (hCard.org) html += '<p class="MF_detail">' + hCard.org + '</p>';
    		html += '</div>';
    		$j('#MF_microformats').append(html);
    	};

    	this.asDownload = function() {
    	    var keys = [], i, parts;
    		var vcard = 'data:text/vcard;utf-8,BEGIN:VCARD' + nl;

    		if (hCard['family-name']) hCard.n = hCard['family-name'];
    		if (hCard['given-name']) {
    			if (hCard.n) hCard.n += ';';
    			hCard.n += hCard['given-name'];
    		}

    		if (hCard.adr) {
    			keys = ['post-office-box', 'extended-address', 'street-address', 'locality', 'region', 'postal-code', 'country-name'];
    			hCard.adr = '';
    			for (i = 0; i < keys.length; i++) {
    				if (hCard[keys[i]]) {
    					hCard.adr += hCard[keys[i]];
    				}
    				hCard.adr += ';';
    			}
    		}

    		if (!hCard.n) {				
    			if (!hCard.n && hCard.fn && (hCard.fn.split(' ').length == 2)) {
    				parts = hCard.fn.split(' ');
    				parts = parts.reverse();
    				hCard.n = parts.join(';');
    			}
    		}

    		keys = ['fn', 'n' , 'org', 'title', 'role', 'note', 'nickname', 'adr', 'email', 'photo', 'url', 'bday'];
    		for (i = 0; i < keys.length; i++) {
    			if (hCard[keys[i]]) vcard += keys[i].toUpperCase() + ':' + encodeURIComponent(hCard[keys[i]]) + nl;
    		}

    		for (i in hCard.tel) {
    			vcard += 'TEL;' + i.toUpperCase() + ':' + hCard.tel[i] + nl;
    		}

    		vcard += 'END:VCARD';
    		return vcard;
    	};

    	return this;
    };

    var hCalendar = function(ve) {
    	found++;
    	var hCal = {}, keys = [], i, kv;

    	keys = ['summary', 'location', 'description', 'attendee', 'contact', 'organizer'] ;
    	for (i = 0; i < keys.length; i++) {
    	    kv = $j('.' + keys[i], ve);
    		if (kv.length) hCal[keys[i]] = cleanString(kv.text(), true);
    	}

    	// collect adr manually
    	if ($j('.adr', ve).length) {
    		keys = ['post-office-box', 'extended-address', 'street-address', 'locality', 'region', 'postal-code', 'country-name'];
    		for (i = 0; i < keys.length; i++) {
                kv = $j('.' + keys[i], ve);
    			if (kv.length) hCal[keys[i]] = cleanString(kv.text());
    			hCal.adr = 1;
    		}
    	}

    	keys = ['dtstart', 'dtend', 'duration'];
    	for (i = 0; i < keys.length; i++) {
    	    kv = $j('.' + keys[i], ve);
    		if (kv.length) hCal[keys[i]] = kv.attr('title');
    	}

    	// how wasteful am I?!
    	if (hCal.dtstart) hCal.dtstart_raw = new cleanDateTime(hCal.dtstart);
    	if (hCal.dtstart_raw) hCal.dtstart = hCal.dtstart_raw.formatted();
    	if (hCal.dtstart_raw) hCal.dtstart_str = hCal.dtstart_raw.toString();
    	if (hCal.dtend) hCal.dtend_raw = new cleanDateTime(hCal.dtend);
    	if (hCal.dtend_raw) hCal.dtend = hCal.dtend_raw.formatted();
    	if (hCal.dtend_raw) hCal.dtend_str = hCal.dtend_raw.toString();

    	if ($j('.url', ve).length) hCal.url = $j('.url', ve).attr('href');
    	if (hCal.url) hCal.url = cleanURL(hCal.url);

    	if (hCal.description) hCal.description = hCal.description.replace(/\n/g, '\\n');

    	var note = 'Source: ' + location.hostname;
    	if (hCal.description) hCal.description += '\n' + note;
    	else hCal.description = note;

    	this.show = function() {
    		var html = '<div class="MF_card MF_vevent">';
    		html += '<p class="MF_header"><a href="' + this.vCalendar() + '" title="Add to calendar">' + hCal.summary + '</a></p>';
    		if (hCal.location) html += '<p class="MF_detail">' + hCal.location + '</p>';
    		if (hCal.dtstart) html += '<p class="MF_detail">' + hCal.dtstart_str + '</p>';

    		html += '</div>';
    		$j('#MF_microformats').append(html);
    	};

    	this.vCalendar = function() {
    	    var keys = [], i;
    		var vcal = 'data:text/calendar;utf-8,';
    		vcal += 'BEGIN:VCALENDAR' + nl + 'VERSION:2.0' + nl + 'BEGIN:VEVENT' + nl;

    		if (hCal.adr) {
    			keys = ['post-office-box', 'extended-address', 'street-address', 'locality', 'region', 'postal-code', 'country-name'];
    			hCal.location = '';
    			for (i = 0; i < keys.length; i++) {
    				if (hCal[keys[i]]) { 
    					if (keys[i] == 'locality') hCal.location += '\n';
    					hCal.location += hCal[keys[i]] + ' ';
    				}
    			}
    		}

    		keys = ['summary', 'location', 'description', 'attendee', 'contact', 'organizer', 'dtstart', 'dtend', 'duration', 'note'];

    		for (i = 0; i < keys.length; i++) {
    			if (hCal[keys[i]]) vcal += keys[i].toUpperCase() + ':' + encodeURIComponent(hCal[keys[i]]) + nl;
    		}

    		vcal += 'END:VEVENT' + nl + 'END:VCALENDAR';
    		return vcal;
    	};

    	return this;
    };

    function cleanEmail(e) {
    	e = e.replace('mailto:', '');
    	return e.replace(/\?.*$j/, '');
    }

    function cleanURL(u) {
    	if (!u.match(/^http/)) {
    		if (u.match(/^\//))	u = location.protocol + '//' + location.hostname + u;
    		else {
    			var parts = location.pathname.split('/');
    			parts.pop();
    			var p = parts.join('/');
    			u = location.protocol + '//' + location.hostname + p + '/' + u;
    		}
    	}
    	return u;		
    }

    function cleanString(s, stripNL) {
    	s = s.replace(/^\s+/, '');
    	s = s.replace(/\s+$j/, '');
    	s = s.replace(/( )+/g, ' ');
    	return stripNL ? s.replace(/\n/g, ' ') : s.replace(/\n/g, '\\n'); // plain text!
    }

    function emptyCheck() {
    	if (!found) {
    		var html = '<div class="MF_card">';
    		html += '<p class="MF_header">No microformats could be found.</p>';
    		html += '</div>';
    		$j('#MF_microformats').append(html);
    	}
    }

    function ie_microformat() {
        // context is A element
        var f = null;
        f = document.getElementById('_mf_iframe');
        if (f) {
            document.body.removeChild(f);
        }
        f = document.createElement('iframe');
        f.style.position = 'absolute';
        f.style.left = '-1000px';
        f.style.width = '10px';
        f.id = "_mf_iframe";
        document.body.appendChild(f);
        // should I recollect?
        f = document.getElementById('_mf_iframe');
        f.src = server + '/save-microformats.html?' + this.href.substr(this.href.indexOf('BEGIN')) + '#' + this.innerHTML;
        return false;
    }
    
    var cleanDateTime = function(t) {
    	// 20060913T1400-0700
    	// 2006-09-13T14:00-07:00

    	var pad = function(s) {
    		if (s.length == 1) s = '0' + s;
    		return s;
    	};

    	var num = function(str, s, e) {
    		return parseInt(str.substr(s, e), 10);
    	};

    	// strip formatting - currently doesn't support 2006-W05
    	var endpos = t.indexOf('T');
    	if (endpos == -1) endpos = t.length;

    	var dstr = t.substr(0, endpos).replace(/\-/g, '');
    	var tstr;

    	if (endpos != t.length) tstr = t.substr(endpos+1).replace(/:/g, '');
    	else tstr = '1200';

    	t = dstr + 'T' + tstr;

    	var d = new Date();
    	d.setFullYear(num(dstr, 0, 4), num(dstr, 4, 2) - 1, num(dstr, 6, 2));
    	d.setHours(num(t, 9, 2), num(t, 11, 2), 0); //  + offset
    	var m = d.getMilliseconds();

    	var offset = num(t, 14, 2) * 60 + num(t, 16, 2); // damn this is noddy.
    	if (isNaN(offset) == false) {
    		if (t.substr(13, 1) != '-') offset *= -1;
    		m = m + (offset * 60 * 1000);
    	}

    	d.setMilliseconds(m);

    	this.formatted = function(){
    		var s = d.getFullYear().toString();
    		s += pad((d.getMonth()+1).toString());
    		s += pad(d.getDate().toString()) + 'T';
    		s += pad(d.getHours().toString());
    		s += pad(d.getMinutes().toString());
    		s += pad(d.getSeconds().toString());
    		if (offset) s += 'Z';
    		return s;
    	};

    	this.toString = function() {
    		return d.toString();
    	};

    	return this;
    };
    
    function import_microformat(type, method, context) {
        if (!context) context = document;
        $j('.' + type, context).each(function(){ method(this).show(); }); 
        $j('iframe', context).each(function () {
            try {
                var f = this.contentWindow.document || this.contentDocument;
                import_microformat(type, method, f);
            } catch (e) {} // can't see inside the iframe - so skip it
        });        
    }

    loadMFTB();
    import_microformat('vcard', hCard);
    import_microformat('vevent', hCalendar);
    emptyCheck();
    styles();
    if (msie && found) {
        $j('#MF_box A').click(ie_microformat);
    }
    positionMicroformatBox();
    $j('#MF_box').fadeIn(600);
}