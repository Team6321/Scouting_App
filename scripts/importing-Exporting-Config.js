function loadSeasonRadioList() //basically a copy paste of loadSeasons(), but didn't want to mess with season config stuff
{
    if (document.cookie.length == 0)
    {
        return;
    } else if (getCookie('seasonList').trim().length == 0)
    {
        return;
    }

    $('#seasonRadioList-imp-exp-data').html(''); //default the radio list
    var seasonList = getCookie('seasonList').split(SEASON_LIST_SEPARATOR).slice(0,-1); //slice removes last ''
    for (var i=0;i<seasonList.length;i++)
    {
        var cookieVal = seasonList[i];
        var newInputHTML = `<label><input type='checkbox' name='seasonListItem-imp-exp-data' value='${cookieVal}'>${cookieVal}</label><br>`
        
        $("#seasonRadioList-imp-exp-data").append(newInputHTML); //season names guaranteed to be unique, don't need to check for duplicates
    }

    $('.js_clear_on_load').val("").html("");
    var cname = checked_seasons_name(); 
    setCookie(cname,'',750);
}

function setCheckedSeasons() //onchange for checked seasons checkboxes
{
    //set a cookie for checkedSeasons
    var arr = [];
    $('input[type=checkbox]').each(function () 
    {
        if (this.checked)
        {
            arr.push($(this).val());
        }
    });

    var cname = checked_seasons_name();
    var cvalue = arr.toString(); //arr gets split up into a csv string
    setCookie(cname,cvalue,750);
}

//Exporting season config \/\/\/
function setExportLink(addend)
{
    $('#configExportLink').attr('href', 'data:text/plain;charset=utf-8,' + addend);
}

function exportData()
{
    setExportLink(''); //default the link
    var config_json = encodeURIComponent(getExportData());
    setExportLink(config_json);
}

function getExportData() //returns prettified (tabbed) json.stringify version of current config
{
    var checkedSeasonList = getCurrCheckedSeasons().split(','); // csv string --> array

    var output = {};
    output['Seasons in this configuration'] = checkedSeasonList; //sets season list at top of config

    for (var i = 0; i < checkedSeasonList.length; i++) //loop through each checked season
    {
        var season = checkedSeasonList[i];

        var cookieList = document.cookie.split(';');

        var elementsArr = []; //for elements of a season
        var questionsArr = []; //for pit questions of a season
        var eventsArr = []; //for events of a season (output will include teams going to each event nested under each event)
        var teamsInEventsArr = [];
        var teamsArr = []; //for team data of a season
        
        var elementStart = `/season_config/${season}/`;
        var pitStart = `${season} pitQuestions`;
        var eventStart = `${season} events`;
        
        for (var j = 0; j < cookieList.length; j++)
        {
            var cookie = cookieList[j].trim();
            var cvalue = cookie.substring(cookie.indexOf('=')+1);
            
            if (cookie.startsWith(elementStart)) //if cookie contains an element
            {
                var objName = getElementName(cookie);
                var objValue = getElementValue(cookie);
                var pair = {};
                pair[objName] = objValue;
                elementsArr.push(pair);
            }

            if (cookie.startsWith(pitStart)) //if cookie contains the pit question list
            {
                //loop through each question in cookie and add that to questionsArr
                var questionList = cvalue.split(COOKIE_QUESTION_SEPARATOR).slice(0,-1); //slice to take off the last '' in arr
                for (var k = 0; k < questionList.length; k++)
                {
                    questionsArr.push(questionList[k]);
                }
            }

            if (cookie.startsWith(eventStart)) //adding events to a season and all teams going to that event
            {
                var eventList = cvalue.split(EVENT_LIST_COOKIE_SEPARATOR).slice(0,-1); //slice takes off last '' in arr
                for (var k = 0; k < eventList.length; k++)
                {
                    //add to event list arr
                    var currEvent = eventList[k];
                    eventsArr.push(currEvent);
                }
            }
        }

        // looping through cookies for each season \/ \/
        var elementsObjName = season + ' elements';
        output[elementsObjName] = elementsArr;

        var pitQuestionsObjName = season + ' pitQuestions';
        output[pitQuestionsObjName] = questionsArr;
        
        var eventsObjName = season + ' events';
        output[eventsObjName] = eventsArr;

        // looping through local storage for each season \/ \/
        var teamDataObjName = season + ' team data';
        teamsArr = returnTeamDataArr(season,eventsArr);
        output[teamDataObjName] = teamsArr;
    }
    
    return JSON.stringify(output,null,'\t');
}

function returnTeamDataArr(season,eventsArr) //returns array to be the value of a team data object
{
    var loc_Strge_Keys = Object.keys(localStorage);
    var total_Output_Arr = [];
    /*
        --> Data for Event A
            --> Data for Team B
                --> Match data for team B
                --> Pit Data for team B
            --> Data for Team C
            ...
    all of ^^ will be an object put into an array ('event a data' is the key, data for team b,c,... is the value)
    and the array will be returned.
    */
    for (var i = 0; i < eventsArr.length; i++) //loop through events in a season
    {
        var currEvent = eventsArr[i];
        var event_Obj = {};
        var event_Obj_Name = `${currEvent} data`;
        var event_Obj_Value = [];
        
        var teams_In_Curr_Event = JSON.parse(getCookie(event_data_cookie_name(season,currEvent))); //object having kv pairs of format teamNum:teamName
        var event_Specific_Teams_Keys = Object.keys(teams_In_Curr_Event); //has team nums 

        for (var j = 0; j < event_Specific_Teams_Keys.length; j++) //loop through teams
        {
            var currTeam = event_Specific_Teams_Keys[j];
            var currTeamName = getTeams(season,currEvent)[currTeam];
            //alert(currTeam);
            
            var team_Obj = {};
            var team_Obj_Name = `Data for team ${currTeam}:${currTeamName}`;
            var team_Obj_Value = []; //will be of length 2: having a match obj and a pit obj
            
            var match_Obj = {};
            var match_Obj_Name = `Match Data for team ${currTeam}`;
            var match_Obj_Value = []; //length is unknown (dont know how many matches per event the team will attend)
            
            var pit_Obj = {}; 
            var pit_Obj_Name = `Pit Data for team ${currTeam}`;
            var pit_Obj_Value = ''; //not an array, only 1 value (only 1 pit entry per event)

            var loc_Strg_Check = `/${season}/${currEvent}/${currTeam}/`; //to check if a key contains the curr event/curr team

            for (var k = 0; k < loc_Strge_Keys.length; k++)
            {
                var curr_loc_Strg_key = loc_Strge_Keys[k];
                if (!curr_loc_Strg_key.startsWith(loc_Strg_Check)) continue; //we know curr key has data on selected team for curr event

                if (curr_loc_Strg_key.includes('Match Data')) //add to match_Obj
                {
                    var match_Data_Arr = JSON.parse(localStorage[curr_loc_Strg_key]); //is an array of smaller element/frequency object pairs
                    match_Obj_Value.push(match_Data_Arr);
                }

                if (curr_loc_Strg_key.includes('pit')) //add to pit_Obj
                {
                    var pit_Data_Arr = JSON.parse(localStorage[curr_loc_Strg_key]); //is an array of smaller Q/A object pairs
                    pit_Obj_Value = pit_Data_Arr;
                }
            }

            //set up match/pit objects
            match_Obj[match_Obj_Name] = match_Obj_Value;
            pit_Obj[pit_Obj_Name] = pit_Obj_Value;

            //add match/pit objects to team object
            team_Obj_Value.push(match_Obj);
            team_Obj_Value.push(pit_Obj);

            //add team object to event object
            team_Obj[team_Obj_Name] = team_Obj_Value;
            event_Obj_Value.push(team_Obj);
        }

        //push event obj to total output array
        event_Obj[event_Obj_Name] = event_Obj_Value;
        total_Output_Arr.push(event_Obj);
    }

    return total_Output_Arr;
}




// Importing Season config \/\/\/
function readImportFile()
{
    var file = $('#importFile').prop('files')[0];

    var fr = new FileReader();
    fr.onload = function(e) {
        var content = e.target.result;
        var obj = JSON.parse(content);

        if (file.name.endsWith('.rcubedscoutconfig'))
        {
            processImportData(obj);
        } else
        {
            $('#importConfirmation').text('No ".rcubedscoutconfig" file selected.');
        }
    }
    fr.readAsText(file);
}

function processImportData(obj) //goes through inner objects and assigns values to cookies
{
    var keys = Object.keys(obj);
    var seasonList = obj[keys[0]]; //seasons at top of import config file
    
    for (var i = 0; i < seasonList.length; i++)
    {
        var season = seasonList[i]; //if season was included, it probably had data; look for element/pit/event/team data for those seasons

        var savedSeasons = getCookie('seasonList');
        if (!savedSeasons.includes(season)) //if season is new, add it to the seasonList cookie
        {
            savedSeasons += season + SEASON_LIST_SEPARATOR;
            setCookie('seasonList',savedSeasons);
        }

        var elementObjName = `${season} elements`;
        var pitObjName = `${season} pitQuestions`;
        var eventObjName = `${season} events`;
        var teamDataObjName = `${season} team data`;
    
        for (var k = 0; k < keys.length; k++) //
        {
            currObj = keys[k];
            if (currObj.startsWith(elementObjName)) //add elements/points cookies
            {
                //set element value pairs
                var innerArr = obj[currObj];
                for (var j = 0; j < innerArr.length; j++)
                {
                    var pair = innerArr[j];
                    var elementName = Object.keys(pair)[0]; //only has one kv pair
                    var elementValue = pair[elementName];
    
                    var cookieName = season_config_cookie_name(season,elementName);
                    setCookie(cookieName,elementValue,750);
                }
            }
    
            if (currObj.startsWith(pitObjName)) //add pitQuestions cookie
            {
                //set pitQuestions cookie
                var cookieName = `${season} pitQuestions`
                var cookieValString = '';
    
                var innerArr = obj[currObj];
                for (var j = 0; j < innerArr.length; j++)
                {
                    cookieValString += innerArr[j] + COOKIE_QUESTION_SEPARATOR;
                }
                setCookie(cookieName,cookieValString,750);
            }

            if (currObj.startsWith(eventObjName)) //add eventList cookie for the season
            {
                var cookieName = eventObjName;
                var cookieValString = '';
                var eventList = obj[currObj];
                for (var j = 0; j < eventList.length; j++)
                {
                    cookieValString += eventList[j] + EVENT_LIST_COOKIE_SEPARATOR;
                }
                setCookie(cookieName,cookieValString,750);
            }

            if (currObj.startsWith(teamDataObjName))
            {   
                processTeamData(season,obj,currObj);
            }
        }
    }
}

function processTeamData(season,originalObject,team_Data_Obj_Key)
{
    var team_Data_Obj_Entry = originalObject[team_Data_Obj_Key];
    var events_In_Team = Object.keys(team_Data_Obj_Entry);

    for (var i = 0; i < events_In_Team.length; i++)
    {
        var curr_Event_Data_Obj = team_Data_Obj_Entry[events_In_Team[i]];
        var curr_Event_Data_Obj_Key = Object.keys(curr_Event_Data_Obj)[0]; //length of 1 only
        var curr_Event_Data_Obj_Value = curr_Event_Data_Obj[curr_Event_Data_Obj_Key]; //is an array with data for each team num

        var curr_Event = curr_Event_Data_Obj_Key.split('data')[0].trim(); //key is in format '{eventName} data'

        var teams_In_Curr_Event = {}; // also need to add a cookie for teams in every event
        for (var j = 0; j < curr_Event_Data_Obj_Value.length; j++)
        {
            var curr_Team_Data_Obj = curr_Event_Data_Obj_Value[j]; //each entry in array is an object with 2 values, match and pit data for the event
            var curr_Team_Data_Obj_Key = Object.keys(curr_Team_Data_Obj)[0];
            var curr_Team_Data_Obj_Value = curr_Team_Data_Obj[curr_Team_Data_Obj_Key]; //is an array with a match object value and a pit object value (length 2)

            var curr_Team_Num = curr_Team_Data_Obj_Key.split(' ').pop().split(':')[0]; //key is in format 'Team data for team ${teamNum}'
            var curr_Team_Name = curr_Team_Data_Obj_Key.split(' ').pop().split(':')[1];
            console.log('currTeamName: ' + curr_Team_Name);
            teams_In_Curr_Event[curr_Team_Num] = curr_Team_Name; //add to object for teams in every event
            
            for (var k = 0; k < curr_Team_Data_Obj_Value.length; k++)
            {
                var match_Or_Pit_Obj = curr_Team_Data_Obj_Value[k];
                var match_Or_Pit_Obj_Key = Object.keys(match_Or_Pit_Obj)[0];
                var match_Or_Pit_Obj_Value = match_Or_Pit_Obj[match_Or_Pit_Obj_Key]; //has array(s) (>1 if match because it has data for each match)

                if (match_Or_Pit_Obj_Key.includes('Match Data'))
                {
                    //has an array full of elment/frequency pair objects in it for every match
                    var num_Matches = match_Or_Pit_Obj_Value.length;

                    for (var m = 0; m < num_Matches; m++)
                    {
                        var curr_Match_Arr = match_Or_Pit_Obj_Value[m];

                        //need to find match num to set a local storage object, {'Match #' : number} is the first object in the array
                        var match_Num_Obj = curr_Match_Arr[0];
                        var match_Num_Key = Object.keys(match_Num_Obj)[0]; //only of length 1
                        var match_Num = match_Num_Obj[match_Num_Key];

                        var local_Storage_Obj_Name = matchAnswerObjName(season,curr_Event,curr_Team_Num,match_Num);
                        var local_Storage_Obj_Value = JSON.stringify(curr_Match_Arr);
                        localStorage.setItem(local_Storage_Obj_Name,local_Storage_Obj_Value);
                    }
                }

                if (match_Or_Pit_Obj_Key.includes('Pit Data'))
                {
                    var local_Storage_Obj_Value = JSON.stringify(match_Or_Pit_Obj_Value); //is just an array with Q/A pair objects in it
                    var local_Storage_Obj_Name = pitAnswerObjName(season,curr_Event,curr_Team_Num);
                    localStorage.setItem(local_Storage_Obj_Name,local_Storage_Obj_Value);
                }
            }
        }
        //set cookie for teams in every event
        var cookie_Name = event_data_cookie_name(season,curr_Event);
        var cookie_Value = JSON.stringify(teams_In_Curr_Event);
        setCookie(cookie_Name,cookie_Value,750);
    }
}

$(document).ready(function()
{
    setExportLink(''); //default export link
    $('#importFile').val(null); //default import link
    loadSeasonRadioList(); //set up radio list


    $('#configExportLink').click(function()
    {
        var seasons = getCurrCheckedSeasons();
        if (seasons.trim().length == 0)
        {
            $('#exportConfirmation').text('No season(s) selected.');
            return false;
        }

        exportData();
        $('#exportConfirmation').text('Data exported.');        
    });

    $('#importButton').click(function()
    {
        readImportFile();
        $('#importConfirmation').text('Data imported.');
    });
});

function checked_seasons_name()
{
    return '/imp-exp-data/checkedSeasons';
}

function getCurrCheckedSeasons() //returns string of checked seasons
{
    var cname = checked_seasons_name();
    var seasonStr = getCookie(cname);

    return (seasonStr.trim().length == 0 ? '' : seasonStr); 
}