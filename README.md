Background
----------
App Annie is a site that compiles app ranking data for various mobile platforms. The site shows up to 500 apps for different platforms, but only 100 are shown immediately; hitting a link runs some JS to show all apps.

Since basic curl scraping can't pull that dynamic content, I'm using Phantom.js to scrape the full list.

Approach
--------
Use Phantom.js to connect to the page. Use jQuery to hit the link to show all apps, then parse out the relevant data.

Setup
-----
Requires Phantom.js
- Download at http://phantomjs.org/download.html
- Quick start guide at https://github.com/ariya/phantomjs/wiki/Quick-Start

Usage
-----
phantomjs app-annie-scraper.js

Output is written to top-apps.tsv (tab-separated values)

To Do
-----
Add other mobile platforms
