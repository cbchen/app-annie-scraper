// Script to scrape App Annie rankings
// author: chris

function scrape_page_to_file(page) {
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
	    ranking++;  // add 1 because ranking is indexed at 0
	    
	    // Within each row, find all td elements of class=app and pull out the app info
	    $(this).find('td.app').each(function(index) {

		var app_data = [ranking];  // initialize with ranking
		app_data.push($(this).find('span.app-name').attr('title').trim());  // app_name
		app_data.push($(this).find('span.app-pub-er').attr('title').trim());  // publisher
		app_data.push(app_types[index]);  // ranking_type
		app_data.push($(this).find('span.var').text().trim());  // ranking_change
		app_data.push($(this).hasClass('has_iap') ? 1 : 0);  // has_in_app_purchases
		app_data.push(format_date(new Date($('span.date').text())));  // report_date

		console.log(app_data.join('\t'));
	    });
	});
    });
    
    outfile.flush();
    outfile.close();   
}

// MAIN SCRIPT

var headers = ['ranking', 'app_name', 'publisher', 'ranking_type', 'ranking_change', 'has_in_app_purchases', 'report_date'];

var fs = require('fs');
outfile = fs.open('OUTPUT.tsv', 'w');
outfile.writeLine(headers.join('\t'));

var page = require('webpage').create();

// Catch console messages and write to file, as that's how we'll get data out of the page
page.onConsoleMessage = function(msg) {
    outfile.writeLine(msg);
};

page.open('http://www.appannie.com/top/', function(status) {
    if (status !== 'success') {
	console.log('could not retrieve page');
	phantom.exit();
    } else {
	page.evaluate(function() {
	    $('a.load-all').click();  // load all of the apps by clicking the anchor
	});
	
	window.setTimeout(function() {  // set timeout to allow additional apps to load
	    scrape_page_to_file(page);
	    phantom.exit();
	}, 2000);
    }
});