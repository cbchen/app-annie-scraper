// Script to scrape App Annie rankings
// author: chris

// TODO: fix utf encoding

var page = require('webpage').create(),
    fs = require('fs');

var outfile = fs.open('top-apps.csv', 'w');
outfile.writeLine('ranking,app,developer,ranking_type,report_date');

page.onConsoleMessage = function (msg) {
    // TODO: find a less hacky way to write to file
    outfile.writeLine(msg);
};

page.open('http://www.appannie.com/top/', function(status) {
    if (status !== 'success') {
	console.log('could not retrieve page');
	phantom.exit();
    } else {
	page.evaluate(function() {
	    $('a.load-all').click();
	});
	
	window.setTimeout(function() {
	    page.evaluate(function() {
		var format_date = function(date) {
		    var month = date.getMonth(), 
		        day = date.getDate();
		    return(date.getFullYear() + '-' + (month >= 10 ? month : '0' + month) + '-' + (day >= 10 ? day : '0' + day));
		};

		var formatted_date = format_date(new Date($('span.date').text()));
		
		var app_types = [];
		$('div.head-helper th div').each(function(index) {
		    app_types.push($(this).text());
		});
		
		$('#storestats-top-table tr').each(function(rank) {
		    rank++;
		    $(this).find('td.app').each(function(index) {
			console.log(rank + ',' + $(this).find('span.app-name').attr('title').trim() + 
				    ',' + $(this).find('span.app-pub-er').attr('title').trim() + ',' + app_types[index] + ',' + formatted_date);
		    });
		});
	    });
	    
	    outfile.flush();
	    outfile.close();
	    phantom.exit();
	}, 2000);
    }
})
