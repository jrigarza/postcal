// Requiring express and body-parser modules (body-parser is used to handle post requests)
var express = require('express');
//var bodyParser = require("body-parser");
var multer = require('multer');

// Creating an instance of express
var app = express();

// Configuring express app to use multer as request handling middleware
let upload = multer({limits: {fieldSize: 5 * 1024 * 1024 }});

// Importing the routes to handle requests with express
require('./routes')(app, upload);

// Starting up the server
app.listen(8081);
console.log('Listening on port 8081...');
