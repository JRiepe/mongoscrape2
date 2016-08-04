
// Dependencies:
var express = require('express');
var app = express();
var request = require('request'); // Snatches html from urls
var cheerio = require('cheerio'); // Scrapes our html
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.text());
app.use(bodyParser.json({type:'application/vnd.api+json'}));
require('./routes/routes.js')(app);
var PORT = process.env.PORT || 8080;

// Database configuration
var mongojs = require('mongojs');
var databaseUrl = "mongodb://heroku_5q88hntj:4ra2fhqg9ape9ojkmh5knhlq05@ds139665.mlab.com:39665/heroku_5q88hntj";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on('error', function(err) {
  console.log('Database Error:', err);
});

//Handlebars-------------------------------------------------------
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
//-----------------------------------------------------------------
app.use(express.static('public'));

// Make a request call to grab the html body from the site of your choice

request('http://www.nationalenquirer.com/', function (error, response, html) {

            var $ = cheerio.load(html);

            $('article').each(function(i, element){
                var title = $(this).find('.promo-title').text();
                var subtitle = $(this).find('.subtitle').text();
                var link = $(this).find('a').attr('href');
                
                if (title && link) {
                  var doc = {
                    title: title,
                    subtitle: subtitle,
                    url: link,
                    
                  }; // end var doc
                console.log(doc);
                } // end if
  // Check for existing document
                db.scrapedData.find({url: link} , function (err, found){
                        var foundDocs = found.length;
                        console.log('foundDocs: ' + foundDocs);
                        if (err) {
                          console.log(err);
                        }
                        else {
  // if no existing document found - create new one
                          if (foundDocs == 0) {
                              db.scrapedData.insert(doc, function (err, saved) {
                                      if (err) {
                                        console.log(err);
                                      }
                                      else {
                                        console.log(saved);
                                        
                                      }   
                              }); // end db.scrapedData

                          } // end if
                        } // end else
                });


            }); // $('article')

}); // end request


// opens server to listen

app.listen(PORT, function(){
  console.log('listening on port', PORT)
});