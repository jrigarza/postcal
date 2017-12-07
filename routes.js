// This controller module defines the allowable requests that can be made.
// The app object is an express instance and the upload object is a multer instance.
// Callback functions are contained in postcal.js

module.exports = function(app, upload){
    var postcal = require('./controllers/postcal');
    app.get('/', postcal.welcome);
    app.post('/detectText', upload.fields([]), postcal.detectText);
    app.get('/cloudToken', postcal.cloudToken)
};
