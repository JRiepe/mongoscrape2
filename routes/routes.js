var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.text());
app.use(bodyParser.json({type:'application/vnd.api+json'}));
app.use(express.static('public'));
var mongojs = require('mongojs');
var databaseUrl = "mongodb://heroku_5q88hntj:4ra2fhqg9ape9ojkmh5knhlq05@ds139665.mlab.com:39665/heroku_5q88hntj";
var collections = ["scrapedData"];
var db = mongojs(databaseUrl, collections);
db.on('error', function(err) {
  console.log('Database Error:', err);
});





var i=0;

// Routes

module.exports = function(app){


/////////////////////////////////////////////////////////////////////////

		app.get('/', function(req, res){
				db.scrapedData.find({}, function(err, found) {
				    
				    // show any errors
				    if (err) {
				    	console.log(err);
				    } 
				    // otherwise, send the books we found to the browser as a json
				    else {
				    	var arrLength = found.length;
					    res.render('index', {
							artTitle: found[i].title,
							artSubtitle: found[i].subtitle,
							theComment: found[i].comment,
							id: found[i]._id,
							articleNum: i+1,
							totalArticles: arrLength,
							urlLink:  found[i].url
						}); // end res.render
				    }
				}); //end db.scrapedData.find({},		
		}); // end app.get('/')

/////////////////////////////////////////////////////////////////////////

		app.get('/index', function(req, res){
				res.redirect('/');
		}); // end app.get('/index')

/////////////////////////////////////////////////////////////////////////

		app.post('/addComment/:id', function(req, res){
				console.log('object id: ' + mongojs.ObjectId(req.params.id));
				console.log('req: ' + req.body.comment);
				var commentInput = req.body.comment.trim();
				if (commentInput) {
						db.scrapedData.update({
							'_id': mongojs.ObjectId(req.params.id)
						}, {
							$set: {
		      					comment: req.body.comment.trim()
		    				}
		  				}, 

						function (err, edited) {
							if (err) throw error;
							res.redirect('/');
						});	 // end db.scrapedData.update 		
				} // end if
				
				else {
						console.log("It's getting there: &"+commentInput)
						res.redirect('/');	
				} // end else
		}); // end app.post('/addComment/:id'

////////////////////////////////////////////////////////////////////////////



		app.post('/delComment/:id', function(req, res){
				db.scrapedData.update({
					'_id': mongojs.ObjectId(req.params.id)
				}, {
					$unset: {
      					comment: ""
    				}
  				}, 

				function (err, deleted) {
					if (err) throw error;
					res.redirect('/');
				});	 // end db.scrapedData.update 
		}); // end app.post('/delComment/:id'



/////////////////////////////////////////////////////////////////////////

		app.get('/lastArticle', function(req, res){
				
				db.scrapedData.find({}, function(err, found) {
				    
				    // show any errors
				    if (err) {
				    	console.log(err);
				    } 
				    // otherwise, send the books we found to the browser as a json
				    else {
						var arrLength = found.length;
				    	if (i > 0){
							i--;
							res.redirect('/');
							}
				       
				    }
				}); //end db.scrapedData.find({},		


		}); // end app.get('/lastArticle')

/////////////////////////////////////////////////////////////////////////

		app.get('/nextArticle', function(req, res){
				
				db.scrapedData.find({}, function(err, found) {
				    
				    // show any errors
				    if (err) {
				    	console.log(err);
				    } 
				    // otherwise, send the books we found to the browser as a json
				    else {

				    	var arrLength = found.length;
					    if (i < arrLength-1){
							i++;
							res.redirect('/');
						}

					    
				    }
				}); //end db.scrapedData.find({},		

		}); // end app.get('/nextArticle')

///////////////////////////  End Routes  ////////////////////////////////////////


}; // end export