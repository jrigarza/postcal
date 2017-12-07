module.exports = function(annotation){

    console.log('In progress: Handling the text received by the Google Vision API.');

    var posterText = JSON.stringify(annotation.textAnnotations[0].description);
    var titleCutOff = posterText.indexOf('\\n') - 1;
    var title = posterText.substr(1, titleCutOff);
    var sentences = posterText.split(/\x5Cn/gi);
    posterText = posterText.replace(/\x5Cn/gi, " "); // this gives clean text without the line breaks
    words = posterText.split(" ");

    console.log('The title of the poster is:' + title);

    var datesArray = extractDates(posterText);
    console.log('The dates found in the poster are:' + datesArray);
    
    var timesArray = extractTimes(posterText);    
    console.log('The times found in the poster are:' + timesArray);

    require('../calendar_request')(title, datesArray, timesArray);

};

var regexMonth = [];

regexMonth.push(/\d\d\.\d\d|\d\d\.\d|\d\.\d\d|\d\.\d|\d\d\/\d\d|\d\d\/\d|\d\/\d\d|\d\/\d/g);
regexMonth.push(/January (\d\d)|January (\d)|Jan.(\d\d)|Jan.(\d)|Jan\. (\d\d)|Jan\. (\d)/gi);
regexMonth.push(/February (\d\d)|February (\d)|Feb.(\d\d)|Feb.(\d)|Feb\. (\d\d)|Feb\. (\d)/gi);
regexMonth.push(/March (\d\d)|March (\d)|Mar.(\d\d)|Mar.(\d)|Mar\. (\d\d)|Mar\. (\d)/gi);
regexMonth.push(/April (\d\d)|April (\d)|Apr.(\d\d)|Apr.(\d)|Apr\. (\d\d)|Apr\. (\d)/gi);
regexMonth.push(/May (\d\d)|May (\d)|May.(\d\d)|May.(\d)|May\. (\d\d)|May\. (\d)/gi);
regexMonth.push(/June (\d\d)|June (\d)|Jun.(\d\d)|Jun.(\d)|Jun\. (\d\d)|Jun\. (\d)/gi);
regexMonth.push(/July (\d\d)|July (\d)|Jul.(\d\d)|Jul.(\d)|Jul\. (\d\d)|Jul\. (\d)/gi);
regexMonth.push(/August (\d\d)|August (\d)|Aug.(\d\d)|Aug.(\d)|Aug\. (\d\d)|Aug\. (\d)/gi);
regexMonth.push(/September (\d\d)|September (\d)|Sep.(\d\d)|Sep.(\d)|Sep\. (\d\d)|Sep\. (\d)/gi);
regexMonth.push(/October (\d\d)|October (\d)|Oct.(\d\d)|Oct.(\d)|Oct\. (\d\d)|Oct\. (\d)/gi);
regexMonth.push(/November (\d\d)|November (\d)|Nov.(\d\d)|Nov.(\d)|Nov\. (\d\d)|Nov\. (\d)/gi);
regexMonth.push(/December (\d\d)|December (\d)|Dec.(\d\d)|Dec.(\d)|Dec\. (\d\d)|Dec\. (\d)/gi);

function extractDates(text){

    console.log('In progress: Extracting dates from poster text.')

    var rawDates = regexMonth.reduce(function(previous, current){
        var result;

        while ( (result = current.exec(text)) ) {
            previous.push(result[0]);
        };

        return previous;

    }, []);

    console.log('Success: Raw dates extracted from poster text.');
    console.log('In progress: Cleaning dates.');

    var cleanDates = rawDates.map(function(current){
        
        var month;
        var day;
        
        for(i = 0; i < regexMonth.length ; i++) {
        
            if(i == 0 && (current.match(regexMonth[i])) ) {

                var splitDate = current.split("/");

                month = parseInt(splitDate[0]) - 1;
                day = parseInt(splitDate[1]);

            } else if ( (current.match(regexMonth[i])) ) {
                
                month = i - 1;

                var stringDay = current.match(/\d\d|\d/);
                day = parseInt(stringDay);

            }

        }

        var cleanDate = new Date();
        cleanDate.setMonth(month);
        cleanDate.setDate(day);

        return cleanDate;
        
    }, new Date() );

    console.log('Success: Clean dates obtained.');
    return cleanDates;
    
}

var regexTime = [];

regexTime.push(/\d\d?:\d\d ?([ap]\.?m\.? ?)?(-|to) ?(noon|midnight)/gi); //double to midnight
regexTime.push(/(noon|midnight) ?(-|to) ?\d\d?:\d\d ?([ap]\.?m\.?)?/gi); //midnight to double
regexTime.push(/\d\d?:\d\d ?([ap]\.?m\.? ?)?(-|to) ?\d\d?:\d\d ?([ap]\.?m\.?)?/gi); // double to double
regexTime.push(/\d\d?:\d\d ?([ap]\.?m\.? ?)?(-|to) ?\d\d? ?([ap]\.?m\.?)?/gi); // double to single
regexTime.push(/\d\d? ?([ap]\.?m\.? ?)?(-|to) ?\d\d?:\d\d ?([ap]\.?m\.?)?/gi); // single to double
regexTime.push(/\d\d? ?([ap]\.?m\.? ?)?(-|to) ?\d\d? ?([ap]\.?m\.?)/gi); // single to single
regexTime.push(/\d\d?:\d\d ?([ap]\.?m\.?)?|\d\d? ?([ap]\.?m\.?)|noon|midnight/gi); // single times

function extractTimes(text){

    console.log('In progress: Extracting times from poster text.')

    var rawTimes = regexTime.reduce(function(previous, current, index){
        var result;

        while ( (result = current.exec(text)) ) {
            text = text.replace(current, ' ');
            previous.push(result[0]);
        };

        return previous;

    }, []);

    console.log(rawTimes);

    var cleanTimes = rawTimes.map(function(current){
        
            var splitTime = [];
            var posmeridianplus = 0;
            
            current = current.replace(/ /g, '');

            // This is a non-elegant method to deal with ranges of the type 6-8PM, makes the 6 be '6PM'
            var rangeTest = [];
            rangeTest.push(/\d\d?:\d\d(to|-)\d\d?:\d\d(p\.?m\.?)/gi);
            rangeTest.push(/\d\d?:\d\d(to|-)\d\d?(p\.?m\.?)/gi);
            rangeTest.push(/\d\d?(to|-)\d\d?:\d\d(p\.?m\.?)/gi);
            rangeTest.push(/\d\d?(to|-)\d\d?(p\.?m\.?)/gi);

            for(i = 0; i < rangeTest.length; i++){

                if(current.match(rangeTest[i])) posmeridianplus = 12;

            }

            //Splits time ranges

            if(current.match(/ ?(to) ?/gi)) {

                splitTime = current.split('to');

            } else if (current.match(/ ?- ?/g)) {

                splitTime = current.split('-');

            } else {

                splitTime.push(current);

            }

            splitTime = splitTime.map(function(curr){

                //Removes whitespaces

                curr = curr.replace(/ /g, '');
                
                //Removes and accounts for AM and PM

                var posmeridian = 0;

                if (curr.match(/p\.?m\.?/gi)) {

                    posmeridian = 12;

                }

                curr = curr.replace(/(a|p)\.?m\.?/gi, '');

                //Splits at colon

                var hoursDigits, minutesDigits;

                if (curr.match(/:/)){

                    var hoursMin = curr.split(':');
                    hoursDigits = parseInt(hoursMin[0]) + posmeridian;
                    minutesDigits = parseInt(hoursMin[1]);

                } else {

                    hoursDigits = parseInt(curr) + posmeridian;
                    minutesDigits = 0;

                }

                return [hoursDigits, minutesDigits];

        });

        if(splitTime.length == 1) return [splitTime[0][0], splitTime[0][1]];
        if(splitTime.length == 2) return [splitTime[0][0] + posmeridianplus, splitTime[0][1], splitTime[1][0], splitTime[1][1]];

    }, []);

    console.log("Success: Clean times obtained.");
    return cleanTimes;

}

