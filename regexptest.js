
        var regexTime = [];
        
        regexTime.push(/\d\d?:\d\d ?([ap]\.?m\.? ?)?(-|to) ?(noon|midnight)/gi); //double to midnight
        regexTime.push(/(noon|midnight) ?(-|to) ?\d\d?:\d\d ?([ap]\.?m\.?)?/gi); //midnight to double
        regexTime.push(/\d\d?:\d\d ?([ap]\.?m\.? ?)?(-|to) ?\d\d?:\d\d ?([ap]\.?m\.?)?/gi); // double to double
        regexTime.push(/\d\d?:\d\d ?([ap]\.?m\.? ?)?(-|to) ?\d\d? ?([ap]\.?m\.?)?/gi); // double to single
        regexTime.push(/\d\d? ?([ap]\.?m\.? ?)?(-|to) ?\d\d?:\d\d ?([ap]\.?m\.?)?/gi); // single to double
        regexTime.push(/\d\d? ?([ap]\.?m\.? ?)?(-|to) ?\d\d? ?([ap]\.?m\.?)/gi); // single to single
        regexTime.push(/\d\d?:\d\d ?([ap]\.?m\.?)?|\d\d? ?([ap]\.?m\.?)|noon|midnight/gi); // single times
    
        var rawTimes = ['8am-5pm', '7:00 - 9:00PM', '6:30 p.m. to midnight'];

        var text = "Nov 8 and the event will be on 11/11";
                
        /* var dates = regexMonth.reduce(function(previous, current){
            var result;

            while ( (result = current.exec(str)) ) {
                previous.push(result[0]);
            };

            return previous;

        }, []); */

       // if(dates[0].match(regexMonth[0])){ console.log("funciona"); };

       var cleanTimes = rawTimes.map(function(current){
        
        var splitTime = [];
        var startHour, startMin, endHour, endMin;
         

        //Splits time ranges

        if(current.match(/ ?(to) ?/gi)) {

            splitTime = current.split('to');

        } else if (current.match(/ ?- ?/g)) {

            splitTime = current.split('-');

        } else {

            splitTime.push(current);

        }

        splitTime = splitTime.map(function(curr, index){

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

            return [splitTime[0][0], splitTime[0][1], splitTime[1][0], splitTime[1][1]];

        
        }, []);

        console.log(cleanTimes);
