// Script to scrape App Annie rankings
// author: chris

function scrape_rankings_to_file(page) {
    page.evaluate(function() {
	// helper function to format date as YYYY-mm-dd
	var format_date = function(date) {
	    var month = date.getMonth(), 
	    day = date.getDate();
	    return(date.getFullYear() + '-' + (month >= 10 ? month : '0' + month) + '-' + (day >= 10 ? day : '0' + day));
	};

	// Pull the different app categories from the table header
	var app_types = $('div.head-helper th div').map(function(index, element) {
	    return $(element).text();
	}).get();
	
	// Process the rankings row by row
	$('#storestats-top-table tr').each(function(ranking) {
	    ranking++;  // add 1 because var ranking starts at 0;

	    // Within each row, find all td elements of class=app and pull out the app info
	    $(this).find('td.app').each(function(index) {
		var td_elem = $(this);
		var app_data = [
		    ranking,  // app_ranking
		    td_elem.find('span.app-name').attr('title').trim(),  // app_name
		    td_elem.find('span.app-pub-er').attr('title').trim(),  // publisher
		    app_types[index],  // ranking_type
		    td_elem.find('span.var').text().trim(),  // ranking_change
		    td_elem.hasClass('has_iap') ? 1 : 0,  // has_in_app_purchases
		    format_date(new Date($('span.date').text()))  // report_date
		];  
		
		console.log(app_data.join('\t'));
	    });
	});
    });    
}

// MAIN SCRIPT
var scrapeJobs = [
    { url: 'http://www.appannie.com/top/iphone/united-states/', hasBeenProcessed: false, outputFile: 'output/iphone' }, 
    { url: 'http://www.appannie.com/top/ipad/united-states/', hasBeenProcessed: false, outputFile: 'output/ipad' },
    { url: 'http://www.appannie.com/top/android/united-states/', hasBeenProcessed: false, outputFile: 'output/android' },
    { url: 'http://www.appannie.com/top/windows/united-states/', hasBeenProcessed: false, outputFile: 'output/windows' }
];

process_next();
// END MAIN SCRIPT


function process_next() {
    for (var i = 0; i < scrapeJobs.length; i++) {
	var scrapeJob = scrapeJobs[i];
	if (scrapeJob.hasBeenProcessed) continue;

	console.log('processing url: ' + scrapeJob.url);
	scrapeJob.hasBeenProcessed = true;
	return process_url(scrapeJob.url, scrapeJob.outputFile, process_next);
    }
    phantom.exit();
}


function process_url(url, outputFile, callback) {
    var fs = require('fs');
    var outfile = fs.open(outputFile, 'w');

    var headers = ['ranking', 'app_name', 'publisher', 'ranking_type', 'ranking_change', 'has_in_app_purchases', 'report_date'];
    outfile.writeLine(headers.join('\t'));
    
    var page = require('webpage').create();
    
    // Catch console messages and write to file, as that's how we'll get data out of the page
    page.onConsoleMessage = function(msg) {
	outfile.writeLine(msg);
    };
    
    page.open(url, function(status) {
	if (status !== 'success') {
	    return console.log('could not retrieve page');
	}
	page.evaluate(function() {
	    $('a.load-all').click();  // load all of the apps by clicking the anchor
	});
	
	window.setTimeout(function() {  // set timeout to allow additional apps to load
	    scrape_rankings_to_file(page);
	    outfile.flush();
	    outfile.close();

	    return callback();
	}, 2000);
    });
};
