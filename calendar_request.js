module.exports = function(posterTitle, posterDates, posterTimes){

        var fs = require('fs');
        var readline = require('readline');
        var google = require('googleapis');
        var googleAuth = require('google-auth-library');

        // If modifying these scopes, delete your previously saved credentials
        // at ~/.credentials/calendar-nodejs-quickstart.json
        var SCOPES = ['https://www.googleapis.com/auth/calendar'];
        var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
            process.env.USERPROFILE) + '/.credentials/';
        var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';

        // Load client secrets from a local file.
        fs.readFile('client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        // Authorize a client with the loaded credentials, then call the
        // Google Calendar API.
        authorize(JSON.parse(content), createEvent);
        });

        /**
         * Create an OAuth2 client with the given credentials, and then execute the
         * given callback function.
         *
         * @param {Object} credentials The authorization client credentials.
         * @param {function} callback The callback to call with the authorized client.
         */
        function authorize(credentials, callback) {
        var clientSecret = credentials.installed.client_secret;
        var clientId = credentials.installed.client_id;
        var redirectUrl = credentials.installed.redirect_uris[0];
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, function(err, token) {
            if (err) {
            getNewToken(oauth2Client, callback);
            } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
            }
        });
        }

        /**
         * Get and store new token after prompting for user authorization, and then
         * execute the given callback with the authorized OAuth2 client.
         *
         * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
         * @param {getEventsCallback} callback The callback to call with the authorized
         *     client.
         */
        function getNewToken(oauth2Client, callback) {
        var authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
        console.log('Authorize this app by visiting this url: ', authUrl);
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('Enter the code from that page here: ', function(code) {
            rl.close();

            oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
            });
        });
        }

        /**
         * Store token to disk be used in later program executions.
         *
         * @param {Object} token The token to store to disk.
         */
        function storeToken(token) {
        try {
            fs.mkdirSync(TOKEN_DIR);
        } catch (err) {
            if (err.code != 'EEXIST') {
            throw err;
            }
        }
        fs.writeFile(TOKEN_PATH, JSON.stringify(token));
        console.log('Token stored to ' + TOKEN_PATH);
        }

        /**
         * Lists the next 10 events on the user's primary calendar.
         *
         * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
         */
        function listEvents(auth) {
        var calendar = google.calendar('v3');
        calendar.events.list({
            auth: auth,
            calendarId: 'primary',
            timeMin: (new Date()).toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime'
        }, function(err, response) {
            if (err) {
            console.log('The API returned an error: ' + err);
            return;
            }
            var events = response.items;
            if (events.length == 0) {
            console.log('No upcoming events found.');
            } else {
            console.log('Upcoming 10 events:');
            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                var start = event.start.dateTime || event.start.date;
                console.log('%s - %s', start, event.summary);
            }
            }
        });
        }

        /**
         * Creates a new event on the user's primary calendar.
         *
         * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
         */

        var eventYear = posterDates[0].getFullYear();
        var eventMonth = posterDates[0].getMonth() + 1;
        var eventDay = posterDates[0].getDate();
        var eventFullDate = '' + eventYear + '-' + eventMonth + '-' + eventDay;

        var eventHour = posterTimes[0][0];
        var eventMinutes = 0;

        var eventEndHour = eventHour + 1;
        if (posterTimes[0][2]) eventEndHour = posterTimes[0][2];

        var eventEndMinutes = eventMinutes;
        if (posterTimes[0][3]) eventEndMinutes = posterTimes[0][3];

        
        if(posterTimes[0][1]) eventMinutes = posterTimes[0][1];
        var eventTime = '';
        if(eventHour < 10)  eventTime = '0' + eventHour; else eventTime = eventTime + eventHour;
        if(eventMinutes < 10) eventTime = eventTime + ':0' + eventMinutes + ':00'; else eventTime = eventTime + ':' + eventMinutes  + ':00';
        var eventEndTime = '';
        if(eventEndHour < 10)  eventEndTime = '0' + eventEndHour; else eventEndTime = eventEndTime + eventEndHour;
        if(eventEndMinutes < 10) eventEndTime = eventEndTime + ':0' + eventEndMinutes  + ':00'; else eventEndTime = eventEndTime + ':' + eventEndMinutes + ':00';
        
        console.log('The event start time is:' + eventTime);
        console.log('The event end time is:' + eventEndTime);

         var event = {
            'summary': posterTitle,
            'description': 'This calenendar entry was inserted by Postcal.',
            'start': {
            'dateTime': '' + eventFullDate + 'T' + eventTime + '-05:00',
            'timeZone': 'America/New_York',
            },
            'end': {
            'dateTime': '' + eventFullDate + 'T' + eventEndTime + '-05:00',
            'timeZone': 'America/New_York',
            },
            'recurrence': [
            'RRULE:FREQ=DAILY;COUNT=1'
            ],
            'attendees': [
            {'email': 'jrgarza@mit.edu'},
            ],
            'reminders': {
            'useDefault': false,
            'overrides': [
                {'method': 'email', 'minutes': 24 * 60},
                {'method': 'popup', 'minutes': 10},
            ],
            },
        };
          

        function createEvent(auth) {
            var calendar = google.calendar('v3');
            calendar.events.insert({
                auth: auth,
                calendarId: 'primary',
                resource: event,
            }, function(err, event) {
                if (err) {
                console.log('There was an error contacting the Calendar service: ' + err);
                return;
                }
                console.log('Event created: %s', event.htmlLink);
            });
        }

    }