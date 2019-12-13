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
    var checkedSeasonList = getCurrCheckedSeasons(); // csv string --> array

    var output = {};
    output[EXPORT_CONFIG_SEASON_LIST_KEY] = checkedSeasonList; //sets season list at top of config

    for (var i = 0; i < checkedSeasonList.length; i++) //loop through each checked season
    {
        var season = checkedSeasonList[i];

        var cookieList = document.cookie.split(';');

        var elementsObj = {}; //for elements of a season
        var questionsArr = []; //for pit questions of a season
        var eventsArr = []; //for events of a season
        
        var elementStart = `/season_config/${season}/`;
        var pitStart = `${season} pitQuestions`;
        var eventStart = `${season} events`;
        
        for (var j = 0; j < cookieList.length; j++)
        {
            var cookie = cookieList[j].trim();
            var cvalue = cookie.substring(cookie.indexOf('=')+1);
            
            if (cookie.startsWith(elementStart)) //if cookie contains an element
            {
                var elementName = getElementName(cookie);
                var elementValue = getElementValue(cookie);
                elementsObj[elementName] = elementValue;
            }

            if (cookie.startsWith(pitStart)) //if cookie contains the pit question list
            {
                parse_cookie(cvalue,COOKIE_QUESTION_SEPARATOR,questionsArr);
            }

            if (cookie.startsWith(eventStart)) //adding events to a season
            {
                parse_cookie(cvalue,EVENT_LIST_COOKIE_SEPARATOR,eventsArr);
            }
        }

        var seasonObjName = season;
        var seasonObjValues = {};

        seasonObjValues[EXPORT_CONFIG_ELEMENTS_KEY] = elementsObj; //set elements

        seasonObjValues[EXPORT_CONFIG_PIT_QUESTIONS_KEY] = questionsArr; //set pit questions
        
        seasonObjValues[EXPORT_CONFIG_EVENTS_KEY] = eventsArr; //set events

        seasonObjValues[EXPORT_CONFIG_TEAM_DATA_KEY] = returnTeamData(season,eventsArr); // set team data


        output[seasonObjName] = seasonObjValues; //put it all together
    }
    
    return JSON.stringify(output,null,'\t');
}

function parse_cookie(cvalue,separator,array)
{
    var list = cvalue.split(separator).slice(0,-1);
    for (var i = 0; i < list.length; i++)
    {
        array.push(list[i]);
    }
}

function returnTeamData(season,eventsArr) //returns array to be the value of a team data object
{
    var loc_Strge_Keys = Object.keys(localStorage);
    var total_Output_Obj = {};
    /*
        --> Event A
            --> Team B
                --> Match data
                --> Pit Data
            --> Team C
            ...
    */
   
    for (var i = 0; i < eventsArr.length; i++) //loop through events in a season
    {
        var currEvent = eventsArr[i];
        var event_Obj_Name = `${currEvent}`;
        var event_Obj_Value = {};
        
        var teams_From_Cookie = getCookie(event_data_cookie_name(season,currEvent));
        if (teams_From_Cookie.trim().length == 0) continue;
        
        var teams_In_Curr_Event = JSON.parse(teams_From_Cookie); //object having kv pairs of format teamNum:teamName
        var event_Specific_Teams_Keys = Object.keys(teams_In_Curr_Event); //has team nums

        for (var j = 0; j < event_Specific_Teams_Keys.length; j++) //loop through teams
        {
            var currTeam = event_Specific_Teams_Keys[j];
            var currTeamName = getTeams(season,currEvent)[currTeam];
            //alert(currTeam);
            
            var team_Obj_Name = `${currTeam}:${currTeamName}`;
            var team_Obj_Value = {}; //will be of length 2: having a match obj and a pit obj
            
            var match_Obj_Name = `match data`;
            var match_Obj_Value = []; //length is unknown (dont know how many matches per event the team will attend)
            
            var pit_Obj_Name = `pit data`;
            var pit_Obj_Value = []; //not an array, only 1 value (only 1 pit entry per event)

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

            //add match/pit objects to team object
            team_Obj_Value[match_Obj_Name] = match_Obj_Value;
            team_Obj_Value[pit_Obj_Name] = pit_Obj_Value;

            //add team object to event object
            event_Obj_Value[team_Obj_Name] = team_Obj_Value;
        }

        //push event obj to total output array
        total_Output_Obj[event_Obj_Name] = event_Obj_Value;
        
    }

    return total_Output_Obj;
}




// Importing Season config \/\/\/
function readImportFile()
{
    var file = $('#importFile').prop('files')[0];

    var fr = new FileReader();
    fr.onload = function(e) {
        var content = e.target.result;
        var obj = JSON.parse(content);

        if (!file.name.endsWith('.rcubedscoutconfig'))
        {
            $('#importConfirmation').text('No ".rcubedscoutconfig" file selected.');
            return;
        }

        var continueOrNot = getImportModalChoice();
        if (continueOrNot.includes('Yes')) //user clicked yes
        {
            closeImportModal();
            processImportData(obj);
            setCookie(import_Modal_Cookie_Name(),'',750); // reset cookie for new cycle
        } else if (continueOrNot.includes('No')) //user clicked no
        {
            closeImportModal();
            setCookie(import_Modal_Cookie_Name(),'',750); // reset cookie for new cycle
        } else if (continueOrNot.trim().length == 0) //user hasn't selected yet or its the first time opening the modal
        {
            showImportModal(obj);
        }
        resetModalInputs();
    }
    fr.readAsText(file);
}

function processImportData(obj) //goes through inner objects and assigns values to cookies
{
    var keys = Object.keys(obj);
    var seasonList = obj[EXPORT_CONFIG_SEASON_LIST_KEY]; //seasons at top of import config file

    for (var i = 0; i < seasonList.length; i++)
    {
        var season = seasonList[i]; //if season was included, it probably had data; look for element/pit/event/team data for those seasons

        var savedSeasons = getCookie('seasonList');
        if (!savedSeasons.includes(season)) //if season is new, add it to the seasonList cookie
        {
            savedSeasons += season + SEASON_LIST_SEPARATOR;
            setCookie('seasonList',savedSeasons);
        }

        //the seaon object in JSON file
        var seasonObjValues = obj[season]; //has keys like 'elements' and 'pit questions'...
    
        //set element/value cookies
        var elementsObj = seasonObjValues[EXPORT_CONFIG_ELEMENTS_KEY];
        var elementKeys = Object.keys(elementsObj);
        for (var j = 0; j < elementKeys.length; j++)
        {
            var elementName = elementKeys[j]; //only has one kv pair
            var elementValue = elementsObj[elementName];

            var cookieName = season_config_cookie_name(season,elementName);
            setCookie(cookieName,elementValue,750);
        }

        //set pitQuestion cookie
        var pitObjArray = seasonObjValues[EXPORT_CONFIG_PIT_QUESTIONS_KEY];
        var pitCookieName = `${season} pitQuestions`
        var pitCookieValString = '';
        for (var j = 0; j < pitObjArray.length; j++)
        {
            pitCookieValString += pitObjArray[j] + COOKIE_QUESTION_SEPARATOR;
        }
        setCookie(pitCookieName,pitCookieValString,750);

        //set event cookie
        var eventObjArray = seasonObjValues[EXPORT_CONFIG_EVENTS_KEY];
        var eventCookieName = `${season} events`;
        var eventCookieValString = '';
        for (var j = 0; j < eventObjArray.length; j++)
        {
            eventCookieValString += eventObjArray[j] + EVENT_LIST_COOKIE_SEPARATOR;
        }
        setCookie(eventCookieName,eventCookieValString,750);

        //set team data local storage objects
        processTeamData(season,seasonObjValues,EXPORT_CONFIG_TEAM_DATA_KEY);

    }
    loadSeasonRadioList() // 'confirmation' to the user that the desired seasons were added
    $('#importConfirmation').text('Data imported.');
}

function processTeamData(season,originalObject,team_Data_Obj_Key)
{
    var team_Data_Obj_Entry = originalObject[team_Data_Obj_Key];
    var events_In_Team = Object.keys(team_Data_Obj_Entry);

    //console.log(events_In_Team);
    for (var i = 0; i < events_In_Team.length; i++)
    {
        var curr_Event = events_In_Team[i];
        var curr_Event_Entries = team_Data_Obj_Entry[curr_Event];
        var teams_In_Curr_Event = Object.keys(curr_Event_Entries); //in format 6321:rouse
        var cookie_Team_Obj = {};

        for (var j = 0; j < teams_In_Curr_Event.length; j++)
        {
            var curr_Team_Key = teams_In_Curr_Event[j];
            var curr_Team_Num = curr_Team_Key.split(':')[0];
            var curr_Team_Name = curr_Team_Key.split(':')[1];
            var team_Specific_Data_Entry = curr_Event_Entries[curr_Team_Key];
            var team_Specific_Data_Keys = Object.keys(team_Specific_Data_Entry);
            //console.log(team_Specific_Data_Keys);

            for (var k = 0; k < team_Specific_Data_Keys.length; k++)
            {
                var match_Or_Pit_Key = team_Specific_Data_Keys[k];
                var match_Or_Pit_Entry = team_Specific_Data_Entry[match_Or_Pit_Key];
                //console.log(match_Or_Pit_Key);

                if (match_Or_Pit_Key.includes('match data'))
                {
                    //has an array full of elment/frequency pair objects in it for every match
                    var num_Matches = match_Or_Pit_Entry.length;

                    for (var m = 0; m < num_Matches; m++)
                    {
                        var curr_Match_Arr = match_Or_Pit_Entry[m];

                        //need to find match num to set a local storage object, {'Match #' : number} is the first object in the array
                        var match_Num_Obj = curr_Match_Arr[0];
                        var match_Num_Key = Object.keys(match_Num_Obj)[0]; //only of length 1
                        var match_Num = match_Num_Obj[match_Num_Key];

                        var local_Storage_Obj_Name = matchAnswerObjName(season,curr_Event,curr_Team_Num,match_Num);
                        var local_Storage_Obj_Value = JSON.stringify(curr_Match_Arr);
                        localStorage.setItem(local_Storage_Obj_Name,local_Storage_Obj_Value);
                    }
                }

                if (match_Or_Pit_Key.includes('pit data'))
                {
                    var local_Storage_Obj_Value = JSON.stringify(match_Or_Pit_Entry); //is just an array with Q/A pair objects in it
                    var local_Storage_Obj_Name = pitAnswerObjName(season,curr_Event,curr_Team_Num);
                    localStorage.setItem(local_Storage_Obj_Name,local_Storage_Obj_Value);
                }
            }
            cookie_Team_Obj[curr_Team_Num] = curr_Team_Name;
        }

        //set cookie for teams in every event
        var cookie_Name = event_data_cookie_name(season,curr_Event);
        var cookie_Value = JSON.stringify(cookie_Team_Obj);
        setCookie(cookie_Name,cookie_Value,750);
    }
}

function showImportModal(object)
{
    var keys = Object.keys(object);
    var seasonList = object[EXPORT_CONFIG_SEASON_LIST_KEY]; // season config list is the entry for the first key
    
    //add seasons to modal text
    var modalText = 'This file contains data that will overwrite the following season(s): <br/><br/>';
    for (var i = 0; i < seasonList.length; i++)
    {
        if (i == seasonList.length-1)
        {
            modalText += `${seasonList[i]}.<br/> `
        } else
        {
            modalText += `${seasonList[i]},<br/> `;
        }
    }
    modalText += '<br/>Are you sure you want to continue importing the data?';
    $('#importModalText').html(modalText);
    $('#importAlertModal').show();
}

function importModalSubmit() //onclick for submit button on import modal
{
    var yesOrNo = $("input[name=import-modal-choice]:checked","#import-Modal-Choices").val();
    var cname = import_Modal_Cookie_Name();
    var cvalue = '';

    if (typeof(yesOrNo) == 'undefined')
    {
        $('#importModalConfirmation').text('No choice selected');
        return;
    }
    if (yesOrNo.includes('Yes'))
    {
        cvalue = 'Yes';
    } else
    {
        cvalue = 'No';
    }
    setCookie(cname,cvalue,750);

    readImportFile(); //read file again
}

$(document).ready(function()
{
    setExportLink(''); //default export link
    $('#importFile').val(null); //default import link
    loadSeasonRadioList(); //set up radio list
    setCookie(import_Modal_Cookie_Name(),'',750);
    resetModalInputs();


    $('#configExportLink').click(function()
    {
        var seasons = getCurrCheckedSeasons();
        if (seasons.length == 0)
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
    });
});

function resetModalInputs()
{
    $('input[name="import-modal-choice"]').prop('checked',false);
}

function closeImportModal()
{
    $('#importAlertModal').hide();
}

function import_Modal_Cookie_Name()
{
    return '/imp-exp-data/continueWithImport';
}

function getImportModalChoice()
{
    var cname = import_Modal_Cookie_Name();
    var cvalue = getCookie(cname);
    if (cvalue.trim().length == 0)
    {
        return '';
    } else
    {
        return cvalue;
    }
}

function getCurrCheckedSeasons() //returns string of checked seasons
{
    var arr = [];
    $('#seasonRadioList-imp-exp-data input[type=checkbox]').each(function () 
    {
        if (this.checked)
        {
            arr.push($(this).val());
        }
    });
    
    return arr;
}

const EXPORT_CONFIG_SEASON_LIST_KEY = 'Seasons in this configuration';
const EXPORT_CONFIG_ELEMENTS_KEY = 'elements';
const EXPORT_CONFIG_PIT_QUESTIONS_KEY = 'pit questions';
const EXPORT_CONFIG_EVENTS_KEY = 'events';
const EXPORT_CONFIG_TEAM_DATA_KEY = 'team data';

const MATCH_DATA_KEY = 'match data';
const PIT_DATA_KEY = 'pit data';