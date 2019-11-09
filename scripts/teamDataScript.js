//credit to w3schools for js tutorials, stackoverflow

function loadTDataPage()
{
    show_TDataModal_Or_IntroText();
    displayTeamRadioList();
}

//shows modal box or displays regular instruction text at top of page
function show_TDataModal_Or_IntroText()
{
    var event = getCurrEvent();
    var eventChecked = (event.trim().length != 0);
    var modalContentHTML = '';
    var introText = '';
    var fieldsetText='';

    if (isSeasonSaved() && eventChecked) //everything is checked, show text at top of page
    {
        var season = getCookie('currCheckedSeason');
        introText = `Here, you can enter and view answers to ` +
        `pit scouting questions entered on the Season Configuration page. You can also add and view data from matches including game ` +
        `element stats and custom notes. These can be cross-referenced for all the events the selected team has attended in the season "${season}".`;
        $('#tDataIntroText').text(introText);

        fieldsetText = `Select a team attending the event "${event}" in the season "${season}."`;
        $('#fieldsetTitle').text(fieldsetText);
        // later, enable all inputs here
        return;
    }
    
    //either one or both of eventChecked or isSeasonSaved() is false, show modal showing one or more of 
    if (!isSeasonSaved())
    {
        modalContentHTML = '<p>No season is currently checked. Go to the <a href="season-config.html">Season Configuration</a> page '+ 
        'to enter new seasons and season-specific elements/pit scouting questions.' + 
        '<br><br>Make sure you check the new season you enter.</p>';
    }

    if (!eventChecked)
    {
        //just for formatting: looks weird if there is a <br><br> before the ev checked message if the season checked message isn't there before it
        var preMessageSpace = isSeasonSaved() ? '' : '<br><br>';
    
        modalContentHTML += preMessageSpace + '<p>No event is currently checked. Go to the <a href="event-data.html">Event Data</a> page '+ 
        'to enter new events and teams attending those events for a selected season.' + 
        '<br><br>Make sure you check the new event you enter.</p>';
    }
    
    $('#tDataModalContent').append(modalContentHTML);
    $('#teamDataAlertModal').show();
}

function closeTDataModal() //onclick for x button in modal
{
    $('#teamDataAlertModal').hide();
}

function displayTeamRadioList()
{
    var season = getCookie('currCheckedSeason');
    var event = getCurrEvent();
    if (season.trim().length == 0 || event.trim().length == 0) return;

    var teamsJSON = getTeams(season,event);
    var keys = Object.keys(teamsJSON);
    for (var i = 0; i < keys.length; i++)
    {
        var teamNumber = keys[i];
        var teamName = teamsJSON[teamNumber];

        $("#teamRadioList").append("<label><input type=\"radio\" name=\"teamListItem\" value=\"" + teamNumber + "\">" + `${teamNumber}: ${teamName}` + "</label><br>"); //add to radiolist
    }
}

//onchange for the team radio list
function changeCurrTeam()
{
    var currTeamNumber = $("input[name=teamListItem]:checked","#teamRadioList").val(); //in prev method, val of each radio item is the tNum
    var currSeason = getCookie('currCheckedSeason');
    var currEvent = getCurrEvent();
    var cname = 'currCheckedTeam';
    var currTeamName = getTeams(currSeason,currEvent)[currTeamNumber];

    if (currSeason.trim().length == 0 || currEvent.trim().length==0 || currTeamNumber.trim().length == 0)
    {
        $("#teamStatsTitle").text('');
        return;
    }

    var cvalue = `/${currSeason}/${currEvent}/${currTeamNumber}`;
    setCookie(cname,cvalue,750);     //curr team cookie --> currCheckedTeam = /{season}/{event}/{currTeamNumber}

    $("#teamStatsTitle").text(`Data for team ${currTeamNumber} : ${currTeamName}`);
    $('.js_clear_on_load').val("").html("");
}

$(document).ready(function(){
    loadTDataPage();
});