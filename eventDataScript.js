//credit to w3schools for js tutorials, stackoverflow

function loadPage()
{
    showTopText();
    displayEventsInRadioList();
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
    if (isSeasonSaved)
    {
        var currSeason = getCookie('currCheckedSeason');
        var cname = '/eventData/'+currSeason+'/';
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
    var cname = 'currCheckedEvent';
    var cvalue = '/'+getCookie('currCheckedSeason')+'/'+currEvent;
    setCookie(cname,cvalue,750);

    
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
    if (document.cookie.length > 0) //if cookies are stored at all
    {
        var cookieName = '/eventData/'+currSeason+'/';
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
        var cname = '/eventData/'+currSeason+'/';
        var cvalue = getCookie(cname) + newEvent + 'Δ';
        setCookie(cname,cvalue,750);

        $("#newEventInputBox").val("");
    }
}

//mirrors the deleteCheckedSeason function
function deleteCheckedEvent()
{
    var currCheckedSeason = getCookie('currCheckedSeason');
    var cookieName = '/eventData/'+currCheckedSeason+'/';
    currEvCookie = getCookie('currCheckedEvent');
    //currEvCookie --> /deep space/pasadena
    var currCheckedEvent = currEvCookie.substring(currEvCookie.lastIndexOf('/')+1);
    
    //splices the eventList cookie and gets rid of the function to be delted
    var eventList = getCookie(cookieName).trim();
    var startIndex = eventList.indexOf(currCheckedEvent);
    var endIndex = startIndex + currCheckedEvent.length;
    var newText = eventList.substring(0,startIndex) + eventList.substring(endIndex+1);
    
    setCookie(cookieName,newText,750); //updates event data cookie
    setCookie('currCheckedEvent','',750); //last checked event was deleted, restart
    document.location.reload();
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


$(document).ready(function(){
    const Enter_key_code = 13;
    $('#newEventInputBox').keypress(function(e){
        if (e.keyCode == Enter_key_code) addNewEvent();
    });

});