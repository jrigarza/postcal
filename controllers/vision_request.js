// This module takes in a base64-encoded image, creates a JSON object per the Google Vision API documentation, and
// sends it to the Vision API through a post request. The response is handled by annotationHandler.js

module.exports = function(encodedImage){
    var request = require('request');

    // Create JSON object to pass on to the API
    var requestBody = '{"requests":[{ "image":{ "content":"' + encodedImage + 
    '"}, "features":[{ "type":"TEXT_DETECTION", "maxResults":1}]}]}';

    var jsonBody = JSON.parse(requestBody);

    console.log('In progress: Post request to Google Vision API.');
    // Do the POST request
    request.post({
        url: 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyAaQPLALywwp17dmqD2TiE-TTjuuzv-FDI',
        body: jsonBody,
        json: true
    }, function(error, response, body){
        console.log('Success: Response received from Google Vision API.');
        require('./annotationHandler')(body.responses[0]);
    });
};