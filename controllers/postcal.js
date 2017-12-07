// This module defines the callbacks used to handle the requests defined in routes.js

exports.welcome = function(req, res) {
    res.sendfile("index.html");    
};

exports.detectText = function(req, res) {
    console.log('Success: Post request with encoded image made to the Postcal server.');
    require('./vision_request')(req.body.encoded);
    res.send('Post successful.');    
};

exports.cloudToken = function(req, res) {
    console.log('Success: Google Oauth token received.');
    res.send(req.query.code);
};