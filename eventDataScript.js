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

//deletes (skips over) a team number/team event pair of all events cookie value
//returns string w/ value of events string, to use for setCookie
function deleteTeamOfEventsCookie(season, currEvent, cookieValAddOn,isNumberAlreadyStored)
{
    var cname = event_data_cookie_name(season,currEvent);
    var allEventsString = getCookie(cname);
    var revisedString = '';

    var storedTeamInfo; //either number or name
    if (isNumberAlreadyStored)
        storedTeamInfo = getTeamNumber(cookieValAddOn); //{teamNumber}Ψ{teamName}θ is format of cookieValAddOn

    //add all teams + θ except the pair with the repeated info
    var teamList = allEventsString.split('θ'); //split all teams
    for (var i = 0; i < teamList.length-1;i++) //length-1 as split makes last arr item ''
    {
        var pair = teamList[i].trim();
        if (pair.includes(storedTeamInfo) || pair === ' ' || typeof(pair) === 'undefined') continue;

        revisedString += pair + 'θ'; //'reconstructing' cookie val structure
    }
    
    return revisedString;
}

function setTeamTable(season, event)
{
    $("#eventSpecificTeamTable").html('<tr><th><b>Team Number</b></th> <th><b>Team Name</b></th> </tr>');
    var cookieList = document.cookie.split(';');
    for (var i = 0; i < cookieList.length; i++)
    {
        if (!cookieList[i].trim().startsWith(event_data_cookie_name(season,event))) continue;

        var teamList = cookieList[i].split('=')[1].split('θ');
        for (var j = 0; j < teamList.length;j++)
        {
            var teamNumber = getTeamNumber(teamList[j]);
            var teamName = getTeamName(teamList[j]);
    
            var newTRHtml = "<tr><td>" + teamNumber + 
            "</td><td>" + teamName + "</td></tr>";
    
            if ($('#eventSpecificTeamTable').html().indexOf(newTRHtml) < 0 &&
            (teamNumber != '' || teamName != ''))
            {
                $('#eventSpecificTeamTable').append(newTRHtml);
            }
        }
    }
}

//onclick for deleting a specific team
function deleteSpecificTeam()
{
    var input = $('#deleteSpecificTeamTextBox').val().trim(); //should be team number
    if (input === '') return;

    //just to make the deleteTeamOfEventsCookie usable as {teamNumber}Ψ{teamName}θ is format of cookieValAddOn
    var teamToDelete = input + 'Ψ' + input + 'θ';
    var season = getCookie('currCheckedSeason');
    var currEvent = getCurrEvent(); 
    var cname = event_data_cookie_name(season,currEvent);
    
    var revisedString = deleteTeamOfEventsCookie(season, currEvent, teamToDelete,true);
    setCookie(cname,revisedString,750);
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
        var teamNumber = $("#teamNumber").val().trim();
        var teamName = $("#teamName").val().trim();
        var currEvent = getCurrEvent();
        
        if (teamNumber !== "" || teamName !== "")
        {
            var season = getCookie('currCheckedSeason');
            if (season !== " ")
            {
                if (currEvent !== ' ')
                {
                    var cookieName = event_data_cookie_name(season,currEvent);
                    //Ψ separates team number and team name, θ separates diff teams
                    var cookieValueAddOn = teamNumber + 'Ψ' + teamName + 'θ';
                    
                    var cookieList = document.cookie.split(";");
                    var teamAlreadyStored = false;
                    var isNameAlreadyStored = false;
                    var storedName;
                    var isNumberAlreadyStored = false;
                    var storedNumber; //only used if isNumberAlreadyStored
                    for (var i = 0; i < cookieList.length;i++)
                    {
                        if (!cookieList[i].trim().startsWith(cookieName)) continue;

                        var str = cookieList[i].split('=')[1].split('θ');
                        
                        //check if team is stored yet
                        for (var j = 0; j < str.length;j++)
                        {
                            //if only name exists
                            if (str[j].includes(teamName))
                            {
                                isNameAlreadyStored = true;
                                teamAlreadyStored = true;
                                storedName = getTeamName(str[j]);
                                break;
                            }
                            //both stored or name already stored
                            else if (str[j].includes(teamNumber) && str[j].includes(teamName))
                            {
                                teamAlreadyStored = true;
                                break;
                            }
                            //number exists but want to change name,
                            else if (str[j].includes(teamNumber) && !str[j].includes(teamName))
                            {
                                isNumberAlreadyStored = true;
                                storedNumber = getTeamNumber(str[j]);
                                break;
                            }
                        }
                    }

                    $("#teamConfirmationBox").text(" ");
                    if (!teamAlreadyStored)
                    {
                        if (isNumberAlreadyStored)
                        {
                            //keep number, change name
                            cookieValueAddOn = storedNumber + 'Ψ' + teamName + 'θ';

                            //skips over team num/name pair with prev stored info and returns new cookie val string
                            var revisedString = deleteTeamOfEventsCookie(season,currEvent,cookieValueAddOn,isNumberAlreadyStored);
                            setCookie(cookieName,revisedString + cookieValueAddOn,750);
                            setTeamTable(season,currEvent);   
                        } else
                        {
                            //add new team to cookie
                            setCookie(cookieName,getCookie(cookieName)+cookieValueAddOn,750);
                            setTeamTable(season,currEvent);
                        }
                        $("#teamConfirmationBox").html('<i>Team ' + teamNumber + ': ' + teamName + ' has been added.<\i>');
                    } else
                    {
                        if (!isNameAlreadyStored) //name and number already exists
                            $("#teamConfirmationBox").html('<i>Team ' + teamNumber + ': ' + teamName + ' already exists.<\i>');
                        else //only name already exists
                            $("#teamConfirmationBox").html('<i>Team ' + storedName + ' already exists.<\i>');
                    }
                    $("#teamNumber").val("").focus();
                    $("#teamName").val("");
                } else
                {
                    $("#teamConfirmationBox").html("<i>Please check an event.<\i>");
                }
            } else
            {
                $("#teamConfirmationBox").html("<i>Please check a season.<\i>");
            }
        } else
        {
            $('#teamConfirmationBox').html("<i>Please fill in both fields.<\i>");
        }     
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

//input format for this function: {teamNumber}Ψ{teamName}
function getTeamNumber(cookieVal)
{
    return cookieVal.substring(0,cookieVal.indexOf('Ψ'));
}

//input format for this function: {teamNumber}Ψ{teamName}
function getTeamName(cookieVal)
{
    return cookieVal.substring(cookieVal.indexOf('Ψ')+1);
}

function getCurrEvent()
{
    var cookieEv = getCookie('currCheckedEvent');
    return cookieEv.substring(cookieEv.lastIndexOf('/')+1);
}