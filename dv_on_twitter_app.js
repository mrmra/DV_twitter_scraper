//PRUNE downed Twitter links
//have an ALGORITHM to look at most common terms -- a linear associative algorithm
//make this look good on MOBILE
//ASK ME at top for t-shirt -- date/time stamp in bottom right corner
//Clean up the code.
//I could store the data at regular intervals by running as a server process -- REDIS/MONGO.

$(document).ready(function() {	
	
	var twoa=new Codebird; // initialize Codebird for Twitter oAuth -- easy library
	var fill = d3.scale.category20(); // sets the Word cloud to use some default colors.
	var search_term='domestic violence'; //default search term
	var toggled=0;
	var wordCounts = {};	//setting a global object;
	var words_array=[]; // setting an array for all the individual words
	var filtered_words_array=[]; //words array filtering out some common words
	var no_duplicates_words_array=[]; //words array filtering out duplicates
	var justwho_words_array=[]; //words array just getting twitter users (i.e. "@" signs)
	var filtered_tweets=[]; //setting an array for the individual TWEET strings in case we want them later
	var filtered_tweet_id=[];
	var x=$("#loadscreen").width(); //dynamic width/height sizes. CSS sets width to a % so it can display okay on more screens.
	var y=$("#loadscreen").height();
	var drawcloudtoggle=0; //toggles to make sure a cloud isn't drawn a second time if oAuth updates
	
	//setup the form for switching between different types of searches -- DV, SA, ST
	
	$('[name=toggleterm]').click(function(){
		toggled=1;		
		drawcloudtoggle=0;
		var input=$(this).val();		
	switch(input)
		{
		case 'SA': search_term='sexual assault'; get_AllTweets(); break;
		case 'DV': search_term='domestic violence'; get_AllTweets(); break;
		case 'ST': search_term='stalking'; get_AllTweets(); break;
		}
	});
	
	if(!toggled){get_AllTweets();} //for the first time user loads page, guarantees a graph using "domestic violence" as search term
	
	//Communicate with twitter
		
	function get_AllTweets(){
	//BEGIN OAuth block -- needed under Twitter API to access
		//all apps have a consumer key/secret, register your app at dev.twitter.com/apps
		twoa.setConsumerKey("mJXPB53dFR3uZYGJSq2xQ", "Y7vkTPEejPJSOvvyFLkHrxqMpjmVrCFPcKXUDiOWWkE");
		twoa.__call("oauth2_token", {}, function (data) {
			console.log(data);
			var bearer_token=data.access_token;
			}
		);
		
	/*var oauth_consumer_key=mJXPB53dFR3uZYGJSq2xQ,
		oauth consumer_secret=Y7vkTPEejPJSOvvyFLkHrxqMpjmVrCFPcKXUDiOWWkE,
	    //You can use "application only" status to request a limited access token
		oauth_access_token,
		oauth_access_secret,
		//where you make your requests
		oauth_baseurl = "https://api.twitter.com",
		//returns "200" if verification succeeded
		oauth_verify_address=URI("#{baseurl}/1.1/account/verify_credentials.json");
	*/
	
	//END OAuth block
	
	//reset data variables
	wordCounts = {};
	words_array=[]; 
	filtered_words_array=[]; 
	no_duplicates_words_array=[];
	justwho_words_array=[]; 
	filtered_tweets=[]; 
	if(toggled){
			$('.svgclass').remove();
			} 
			
	//set our loadscreen to display as data comes in
	$("#loadscreen").fadeIn(600, function(){$(this).show();});
	//CHANGE HERE FOR NEW API 1.1
	twoa.__call("search_tweets", "q="+search_term+"&count=60",
	//$.getJSON("https://api.twitter.com/1.1/search/tweets.json?q="+search_term+";rpp=60&amp;callback=?", //75 works okay
	//$.getJSON("http://search.twitter.com/search.json?q="+search_term+";rpp=60&amp;callback=?", //75 works okay
	//OKAY, so we have our TWITTER DATA and now need a CALLBACK to do stuff with that data:	
		function(data){
			//some variables are declared that I'll use to FILTER OUT the Twitter search results to just TWITTER TEXT strings (the tweet!)
			var filtered_string="";
			var filtered_obj=data.statuses; // we only want the "results"-objects part of the nested data object returned from Twitter.
			var general_filter=/\bdomestic\b|\bviolence\b|\bsexual\b|\bassault\b|\bstalking\b|\bafter\b|\babout\b|\bbeen\b|\bcould\b|\bdoing\b|\beverything\b|\bfrom\b|\bgoing\b|\bhave\b|\binto\b|\bjust\b|\blike\b|\bmake\b|\bmore\b|\bonly\b|\brather\b|\bstill\b|\bsure\b|\bthan\b|\bthen\b|\bthat\b|\bthats\b|\btheir\b|\bthese\b|\bthey\b|\bthis\b|\btweeting\b|\btweet\b|\bwasnt\b|\bwell\b|\bwhen\b|\bwhether\b|\bwill\b|\bwith\b|\bwhat\b|\bwould\b|\byour\b|\b.\b|\b..\b|\b...\b/i;
			var exceptions_filter=/\bno\b/i;
			var justwho_filter=/\b@*\b/i;
						
			$.each(filtered_obj, function(key, val) {
				filtered_string=filtered_string+val.text; //this pops the TEXT (the tweet!) from each results object onto a string to cutup into words
			});
			$.each(filtered_obj, function(index, val) {
				filtered_tweets[index]=val.text; //this pops the TEXT (the tweet!) from each results object onto an ARRAY in case we want a whole tweet later
				filtered_tweet_id[index]=val.id_str; // pops the ID in case we need it later
			});						
			//now we want to take that STRING and move EACH INDIVIDUAL WORD into an array, each word being on its own index
			for(var i=0, j=0; i<filtered_string.length; i++) {
			if (filtered_string[i] == " "){j++;} 
				else { 
					if(words_array[j] == undefined || null) {words_array[j]=filtered_string[i];} //remember to set the FIRST LETTER of a new word, or it will be UNDEFINED
					else {words_array[j] = words_array[j].concat(filtered_string[i]);}
				}
			}
			
			/*
			rather than the for loop above, I tried using a more elegant global regexp, which should increment .lastIndex,
			but didn't and created an infinite loop ...
			while((words_array = word_filter.exec(filtered_string)) !== null){
			}*/
			
			//FILTER the array further to get words ASSOCIATED with DV!
			filtered_words_array=words_array.filter(function (item, index, array) {
				if(!general_filter.test(item) || exceptions_filter.test(item)) { return item;} 
			});
			//filter a NO DUPLICATES word array
			$.each(filtered_words_array, function(index, item){
				if($.inArray(item, no_duplicates_words_array) === -1) no_duplicates_words_array.push(item);
			});
			//filter just the Twitter authors by @ symbol
			justwho_words_array=filtered_words_array.filter(function (item, index, array) {
				if(justwho_filter.test(item)) { return item;} 
			});
					
			if(filtered_words_array){var length = filtered_words_array.length;} else console.log("words_array is null.");
			
			/*okay, now we're going to count words! This is easy, we just make an object with a KEY (the word) for every unqiue index, and then
			  for each time it comes up, we increment the VALUE of the KEY by one. Easy, simple way to count!*/
			for(var i = 0; i < length; i++){
				wordCounts[filtered_words_array[i]] = (wordCounts[filtered_words_array[i]] || 0) + 1;
			}			
			//checks to see if toggled is true, in which case there is ALREADY a SVG that needs to be cleared
			
			layout_Cloud(); //passes wordCounts -- with WORDS as KEYS and the VALUE a number of the times the word appears
		}, true		
	);
}
  
  //now we're going to DRAW the Cloud! In d3, first you layout the data, and then you actually draw an svg with append.svg.
  
  /*var tooltip_div = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);*/

  var searchform_div=d3.select("#searchform").append("div")
	  .attr('id', 'tweetbox');
	  
  
  function layout_Cloud(){
	//make sure not drawing a second if already drawn
  if(!drawcloudtoggle){
  drawcloudtoggle=1;
  d3.layout.cloud().size([x, y])
		//.words(function(d){return {text: d.key, size: 10+d.value*4};})
      .words(no_duplicates_words_array.map(function(d) {
        return {text: d, size: 10 + wordCounts[d] * 6};
      }))
      .rotate(function() { return (Math.random() * 2) * 57; })
      .font("Impact")
      .fontSize(function(d) { return d.size; })
      .on("end", draw_Cloud)
      .start();
	}
  }
  function draw_Cloud(words){	      
	d3.select("body").append("svg").attr("class", "svgclass")
        .attr("width", x)
        .attr("height", y)
      .append("g")
        .attr("transform", "translate("+x/2+","+y/2+")")
      .selectAll("text")
        .data(words)
      .enter().append("text")
		.on("mouseover", show_Node_Tweets) //TOOLTIP that shows the full tweets
        .on("mouseout", hide_Node_Tweets)
		.style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "Impact")		
        .style("fill", function(d, i) { return fill(i); })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
	//fadeout the loadscreen after load
	$("#loadscreen").fadeOut(800, function(){$(this).hide();});
	};
	
	
  function show_Node_Tweets(d){  
	// console.log("Show node tweets!");
	// console.log(d);
	currentword=d.text;
	currentnode=this;
	// console.log(currentnode);
	var xcenter = 0-d.xoff;
	var ycenter = 0-d.yoff;
	var rotateback=0-d.rotate;
	var save_transform=currentnode.transform;
	var filter_word=new RegExp(d.text);
	var list_of_tweets=[];	
	var list_of_tweets_string='';
	var list_of_tweets_linked='';
	var list_of_tweets_id='';
	//filter tweets based on the word moused over
	list_of_tweets_index=filtered_tweets.filter(function(item, index, array){
		if(filter_word.test(item)) {
		list_of_tweets_id=filtered_tweet_id[index]; // leaves me with the last most recent tweet's ID, which is what I want for display! (avoids broken Twitter links)
		list_of_tweets_string=item; //pulls the last tweet
		return item;
		}
	});
	
	/*this pulls ALL the tweets, but we just wanted the last, as above, to avoid broken links
		$.each(list_of_tweets_index, function(index, val) {
		list_of_tweets_id=filtered_tweet_id[val];
	list_of_tweets_string=list_of_tweets_string+val;});
	*/	
	
	list_of_tweets_linked=list_of_tweets_string.autoLink({ target: "_blank"});
	
	d3.select(this).transition().duration(700).style("font-size", d.size + 34 +"px"); //this ANIMATES the word bigger a bit

	$(this).click(function(){		
	/*twoa call to slow on their servers, so back to old way.
		//$.getJSON("https://api.twitter.com/1/statuses/oembed.json?id="+list_of_tweets_id+"&align=center", function(data){
		twoa.__call("statuses_oembed", "id="+list_of_tweets_id, function(data){
			var tweet_html=data.html;
			var tweet_url=data.url;
			searchform_div.html(tweet_html+'<p><a href="'+tweet_url+'" target="_blank">Connect to Tweet on Twitter</a></p>');
			}, true);*/
		
		searchform_div.html('<strong>'+currentword+': </strong> '+list_of_tweets_linked);
		
				
	});	  
	  
	};
  function hide_Node_Tweets(d){	
	d3.select(this).transition().duration(500).style("font-size", d.size +"px"); //this returns the word size to normal
	//tooltip_div.transition().duration(500).style("opacity", 0);   
	};
 });
 
