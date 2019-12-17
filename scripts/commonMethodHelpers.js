function openNav(){
    document.getElementById("mySidenav").style.width= "250px";
}

//closing navbar
function closeNav(){
document.getElementById("mySidenav").style.width="0";
}

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

function getCurrSeason()
{
    var cname = 'currCheckedSeason';
    return getCookie(cname);
}

function getCurrEvent()
{
    var cookieEv = getCookie('currCheckedEvent');
    return cookieEv.substring(cookieEv.lastIndexOf('/')+1);
}

//returns JSON object of teams
function getTeams(season, currEvent)
{
    var cname = event_data_cookie_name(season,currEvent);
    var cvalue = getCookie(cname);
    if (cvalue.trim().length == 0) return {}; //empty object

    var result = JSON.parse(cvalue);
    return result;
}

function getCurrTeamNumber()
{
    var cvalue = getCookie('currCheckedTeam'); //contains number of team
    var season = getCurrSeason();
    var event = getCurrEvent();

    if (cvalue.trim().length == 0 || season.length==0 || event.length==0) return 0;

    return cvalue.substring(cvalue.lastIndexOf('/')+1); //returns last part of /{season}/{event}/{teamNumber}
}

function getCurrTeamName()
{
    var season = getCookie('currCheckedSeason');
    var event = getCurrEvent();
    var teamNumber = getCurrTeamNumber();
    if (!checkForNull(teamNumber)) return '';

    var teamsJSON = getTeams(season,event);
    return teamsJSON[teamNumber];
}

function checkForNull(obj) //stack overflow, returns true if parameter ISNT null
{
    return obj && obj !== null && obj !== 'undefined';
}

const COOKIE_QUESTION_SEPARATOR = 'Ω';
const SEASON_LIST_SEPARATOR = '§';
const EVENT_LIST_COOKIE_SEPARATOR = 'Δ';