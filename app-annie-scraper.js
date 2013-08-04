var page = require('webpage').create();

page.onConsoleMessage = function (msg) {
    console.log('CONSOLE: ' + msg);
};

page.open('http://www.appannie.com/top/', function(status) {
    if (status !== 'success') {
	console.log('could not retrieve page');
    } else {
	console.log(
	    page.evaluate(function() {
		return $('td.app').length;
	    }) + ' apps found'
	);

	page.evaluate(function() {
	    console.log('clicking load-all anchor');
	    $('a.load-all').click();
	});

	window.setTimeout(function() {
	    page.evaluate(function() {
		console.log('now there are ' + $('td.app').length + ' apps')
	    });

	    phantom.exit();
	}, 2000);
    }
})
