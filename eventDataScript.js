//credit to w3schools for js tutorials, stackoverflow

function loadPage()
{
    showTopText(); // 'showing event data for...
    displayEventsInRadioList();
    setCookie('currCheckedEvent','',750);
    $('.js_clear_on_load').val("").html("");
}

function isSeasonSaved()
{
    var currSeason = getCookie('currCheckedSeason');
    if (currSeason !== " ")
        return true;
    else
        return false;
}

//shows intro text for page
function showTopText()
{
    var finalText;
    if (isSeasonSaved())
    {
        var currSeason = getCookie('currCheckedSeason');
        finalText = 'Here, enter all the events that the team will attend for season "' + currSeason + '".';
    } else
    {
        finalText = 'No season is currently saved. Go back to the Season Configuration page ' + 
        'to enter new seasons and season-specific elements/pit scouting questions. Make sure you check the new season you enter.'
    }
    $("#eventDataIntroText").text(finalText);
}

function displayEventsInRadioList()
{
    if (isSeasonSaved())
    {
        var currSeason = getCookie('currCheckedSeason');
        var cname = currSeason + ' events';
        if (getCookie(cname) !== ' ')
        {
            var eventList = getCookie(cname).split('Δ');
            for (var i = 0; i < eventList.length; i++)
            {
                var cookieVal = eventList[i];
                if (!$('#eventRadioList').html().includes(cookieVal))
                {
                    $("#eventRadioList").append("<label><input type=\"radio\" name=\"eventListItem\" value=\"" +cookieVal + "\">"+cookieVal + "</label><br>");
                }
            }
        }
    }
}

//onchange for the event radio list
function changeCurrEvent()
{
    //curr event cookie --> currCheckedEvent = /{currCheckedSeason}/{currEvent}/
    var currEvent = $("input[name=eventListItem]:checked","#eventRadioList").val();
    var currSeason = getCookie('currCheckedSeason');
    var cname = 'currCheckedEvent';
    var cvalue = '/'+currSeason+'/'+currEvent;
    setCookie(cname,cvalue,750);

    setTeamTable(currSeason,currEvent);
    $("#teamConfirmationBox").text('');
    $('.js_clear_on_load').val("").html("");
}


//event cookies --> /eventData/{eventNames}/Austin District EventΔPasadena...
function addNewEvent()
{
    var newEvent = $("#newEventInputBox").val().trim().toString();
    var currSeason = getCookie('currCheckedSeason');

    if (currSeason === " ") //if season is blank don't continue with function
    {
        $("#newEventConfirmation").html("<i>No season checked. Go to the Season Configuration Page to set up a new season or check an existing season.</i>"); //confirmation text
        return;   
    }

    var isAlreadyStored = false;
    var cookieName = currSeason + ' events';

    if (document.cookie.length > 0) //if cookies are stored at all
    {
        if (cookieName !== "")
        {
            var eventNames = getCookie(cookieName).split("Δ"); //Δ is an uncommon separator that user can't type
            for (var i=0;i<eventNames.length;i++)
            {
                var val = eventNames[i].trim();
                if (newEvent==val.toString())
                {
                    isAlreadyStored = true;
                    break;
                }
            }
        }
    }

    if (isAlreadyStored) //if season is already stored
    {
        $("#newEventConfirmation").html("<i>Event \'" + newEvent +"\' already exists.</i>");    
    } else
    {
        //add to radioList
        $("#newEventConfirmation").html("<i>Event " + "\'"+ newEvent +"\'"+" has been added.</i>"); //confirmation text
        $("#eventRadioList").append("<label><input type=\"radio\" name=\"eventListItem\" value=\"" + newEvent + "\">" + newEvent +"</label><br>"); //add to radiolist

        //save newSeason in cookie
        var cvalue = getCookie(cookieName) + newEvent + 'Δ';
        setCookie(cookieName,cvalue,750);

        $("#newEventInputBox").val("");
    }
}

//mirrors the deleteCheckedSeason function
function deleteCheckedEvent()
{
    var currCheckedSeason = getCookie('currCheckedSeason');
    //cookie --> 'deep space events=austinΔfit champsΔ...'
    var cookieName = currCheckedSeason + ' events';
    var cookieVal = getCookie(cookieName);
    var currCheckedEvent = getCurrEvent();
    var cnameEnding = currCheckedSeason + '/' + currCheckedEvent;
    
    //splices the eventList cookie and gets rid of the function to be deleted
    var eventList = cookieVal.trim();
    var startIndex = eventList.indexOf(currCheckedEvent);
    var endIndex = startIndex + currCheckedEvent.length;
    var newText = eventList.substring(0,startIndex) + eventList.substring(endIndex+1);
    
    setCookie(cookieName,newText,750); //updates event data cookie
    setCookie('currCheckedEvent','',750); //last checked event was deleted, restart cookie
    
    //delete team names for that event
    var cname = '';
    var cookieList = document.cookie.split(';');
    for (var i = 0; i < cookieList.length;i++)
    {
        var currCname = cookieList[i].trim().split('=')[0];
        if (currCname.endsWith(cnameEnding))
        {
            cname = currCname;
        }
    }
    deleteCookie(cname);

    document.location.reload();
}


function setTeamTable(season, event)
{
    var currEvent = getCurrEvent();
    var currSeason = getCookie('currCheckedSeason');
    if (currEvent !== ' ')
    {
        $('#teamTableTitle').text('Teams for event "' + currEvent + '."');
    }
    $("#eventSpecificTeamTable").html('<tr><th><b>Team Number</b></th> <th><b>Team Name</b></th> </tr>');

    var teamsJSON = JSON.parse(getCookie(event_data_cookie_name(season,currEvent)));
    if (teamsJSON == '{}') return;
    const pairs = Object.entries(teamsJSON);
    for (var i = 0; i < pairs.length; i++)
    {
        var teamNumber = pairs[i][0];
        var teamName = pairs[i][1];

        var newTRHtml = "<tr><td>" + teamNumber + 
        "</td><td>" + teamName + "</td></tr>";

        if ($('#eventSpecificTeamTable').html().indexOf(newTRHtml) < 0 &&
        (teamNumber != '' || teamName != ''))
        {
            $('#eventSpecificTeamTable').append(newTRHtml);
        }
    }
}

//onclick for deleting a specific team based on number
function deleteSpecificTeam()
{
    var input = $('#deleteSpecificTeamTextBox').val().trim(); //should be team number
    if (input === '') return;

    var season = getCookie('currCheckedSeason');
    var currEvent = getCurrEvent(); 
    var cname = event_data_cookie_name(season,currEvent);
    var teamsJSON = JSON.parse(getCookie(cname));

    delete teamsJSON[input];
    setCookie(cname,JSON.stringify(teamsJSON),750);
    setTeamTable(season,currEvent);
    $("#deleteSpecificTeamTextBox").val("").focus();
}

$(document).ready(function(){
    loadPage();

    const Enter_key_code = 13;
    $('#newEventInputBox').keypress(function(e){
        if (e.keyCode == Enter_key_code) addNewEvent();
    });

    //event specific teams code
    $('#teamName').keypress(function(e){
        if (e.keyCode == Enter_key_code) $('#teamSaveButton').click();
    });

    $('#deleteSpecificTeamTextBox').keypress(function(e){
        if (e.keyCode == Enter_key_code) deleteSpecificTeam();
    });

    $('#teamSaveButton').click(function(){
        var currSeason = getCookie('currCheckedSeason');
        var currEvent = getCurrEvent();
        var teamNumber = parseInt($("#teamNumber").val().trim());
        var teamName = $("#teamName").val().trim();
        var teams = {};

        if (teamNumber === "" || teamName === "")
        {
            $('#teamConfirmationBox').html("<i>Please fill in both fields.<\i>");
            return;
        }

        if (currSeason === ' ')
        {
            $("#teamConfirmationBox").html("<i>Please check a season.<\i>");
            return;
        }

        if (currEvent === ' ')
        {
            $("#teamConfirmationBox").html("<i>Please check an event.<\i>");
            return;
        }

        var cname = event_data_cookie_name(currSeason,currEvent);
        var teams;
        var raw_stored_data = getCookie(cname).trim();
        if (!raw_stored_data == '') //if cookie is stored yet
        {
            teams = JSON.parse(raw_stored_data);
        } else //cookie not stored yet
        {
            teams = {};
        }
        teams[teamNumber] = teamName;
        setCookie(cname,JSON.stringify(teams),750);
        setTeamTable(currSeason,currEvent);
        
        $("#teamConfirmationBox").html('<i>Team ' + teamNumber + ': ' + teamName + ' has been added.<\i>');
        $("#teamNumber").val("").focus();
        $("#teamName").val("");
    });
});

// helper methods below

function deleteCookie(name)
{
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';   
}

function setCookie(cname, cvalue, exdays=750) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(name)
{
    var re = new RegExp(name + "=([^;]+)");
    var value = re.exec(document.cookie);
    return (value != null) ? unescape(value[1]) : " ";
}

function event_data_cookie_name(season,event)
{
    return `/event_data teams/${ season }/${ event }`;
}

function getCurrEvent()
{
    var cookieEv = getCookie('currCheckedEvent');
    return cookieEv.substring(cookieEv.lastIndexOf('/')+1);
}