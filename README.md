This is a twitter-scraper for domestic violence-related terms. It connects with a quick oAuth, scrapes Twitter for recent search terms, and displays
them in a "Wordle"-style D3 graphical map.

It is NOT cleverly built -- really, the Twitter interface should be hidden on the server-side and generate a file for the word cloud to read; 
instead, I just quickly coded it using the codeBird oAuth library, D3, and Jason Davies
Wordle library (see below). There are a few things in here which are unique to me, such as the data-scraping, 
animating the words to increase in size on mouseover, and a few other little tricks. Note that there are large load times because of querying
Twitter and going through codeBird (rather than using my own implementation of oAuth on the server).

Things to do:

Move the Twitter scraping server-side and store long-term results in Redis or MongoDB, and generate a comma-separated text file 
for the Wordle (so that the load time for the graphic is eliminated, passwords better preserved, etc, etc, etc) or serve it from the DB.

Since the server this will be on uses PHP, the twitter-scraping should be done in PHP, or perhaps PHP calling a Python script, if the server allows.


# Word Cloud Layout

This is a [Wordle](http://www.wordle.net/)-inspired word cloud layout written
in JavaScript. It uses HTML5 canvas and sprite masks to achieve
near-interactive speeds.

See [here](http://www.jasondavies.com/wordcloud/) for an interactive
demonstration along with implementation details.

![Example cloud of Twitter search results for “amazing”](http://www.jasondavies.com/wordcloud/amazing.png)

## Usage

See the samples in `examples/`.

This layout requires [D3](http://mbostock.github.com/d3/).  It’s similar to
[d3.layout.force](https://github.com/mbostock/d3/wiki/Force-Layout), in that
it’s **asynchronous** and **stateful**.
