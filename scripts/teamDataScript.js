//credit to w3schools for js tutorials, stackoverflow

function loadTDataPage()
{
    show_TDataModal_Or_IntroText();
    displayTeamRadioList();
    setCookie('currCheckedTeam','',750);

    $('.js_clear_on_load').val("").html("");
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

        var newItem = "<label><input type=\"radio\" name=\"teamListItem\" value=\"" + teamNumber + "\">" + `${teamNumber}: ${teamName}` + "</label><br>";
        $("#teamRadioList").append(newItem); //add to radiolist
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
    $('#pitScoutingTitle').text(`Pit Scouting Questions and Answers for team ${currTeamNumber}: ${currTeamName}`);
    $('.js_clear_on_load').val("").html("");

    displayQuestionTable();
    //loadMatch();
}

//basically copy pasted from w3schools, onclick for a change in tabs
function displayTabContent(evt, tabName)
{
    var i, x, tablinks;
    x = document.getElementsByClassName("tabContent");
    for (i = 0; i < x.length; i++) {
      x[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tabs");
    for (i = 0; i < x.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" w3-bottombar-gold", " w3-bottombar-maroon");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.firstElementChild.className += " w3-bottombar-gold";

    if (tabName.startsWith('pit')) //function calls for pit page
    {
        $('.js_clear_on_load').val('').html('');
        displayQuestionTable();
    } else //function calls for match page
    {

    }
}

function displayQuestionTable()
{
    var season = getCookie('currCheckedSeason');
    var cname = season + ' pitQuestions';
    var event = getCurrEvent();
    var questions = getCookie(cname).split('Ω'); //Ω is separator for questions
    var currTeam = getCurrTeamNumber();

    if (currTeam.trim().length == 0)
    {
        $('#questionTable').html('');
        $('#qTableConfirmation').text('No team selected.');
        return;
    }

    var tableHeader = '<tr class="q-tr"> <th class="q-th"><b>Question</b></th> <th class="q-th"><b>Answer</b></th> </tr>';
    $('#questionTable').html(tableHeader); //default start of table

    var localStorageObjName = pitAnswerObjName(season,event,currTeam);
    var team_QA_pairs = JSON.parse(localStorage.getItem(localStorageObjName)); //get QA pairs that may/may not have already been stored
    var teamsAlreadyStoredBool = false;
    if (checkForNull(team_QA_pairs))
    {
        teamsAlreadyStoredBool = true;
    }

    for (var i = 0; i < questions.length;i++)
    {
        var question = questions[i];
        if (question.trim().length == 0) return;
        
        //loop through already stored local object: if question has an answer already stored then put that in the input box. Else, leave it empty (to fill in)
        var potentialAnswer = '';
        if (teamsAlreadyStoredBool == false) //len of loc storage obj == 0, nothing stored yet
        {
            potentialAnswer = '';
        } else //len of loc storage obj = 1, something stored inside, now find answer to curr question
        {
            for (var j = 0; j < team_QA_pairs.length; j++)
            {
                var pair = team_QA_pairs[j];
                var answer = pair[question];
                if (!checkForNull(answer))
                {
                    continue;
                }
                potentialAnswer = answer;
            }
        }

        var inputHTML = `<input type="text" value="${potentialAnswer}" class="q-input">`; //pot answer is either '' or what is stored
        var newTRHtml = '<tr class="q-tr"><td class="q-td">' + question + '</td><td class="q-td">' + inputHTML + "</td></tr>";
        
        if ($('#questionTable').html().indexOf(question) < 0) //if table doesn't already have it
        {
            $('#questionTable').append(newTRHtml);
        }
    }

    //cookie will be a json object: /{season}/{event}/pit = {team}
}

function pitAnswerObjName(season,event,team)
{
    return `/${season}/${event}/${team}/pit`;
}

function savePitAnswers()
{
    //using local storage to save pit answers, one localStorage obj per team per event
    // { '/{season}/{event}/{team}/pit answers' : {{question1}:{answer1}, {question2}:{answer2}...} }
    //local storage obj will hold an array of q/a object pairs

    var season = getCookie('currCheckedSeason');
    var event = getCurrEvent();
    var team = getCurrTeamNumber();

    var all_team_QA_pairs_obj = [];
    $('#questionTable tr').each(function(){ //for each row
        var question = $(this).find('td:first').text();
        var answer = $(this).find('td:last').find('input').val();

        var pair = {};
        pair[question] = answer;
        all_team_QA_pairs_obj.push(pair);
    });

    var objName = pitAnswerObjName(season,event,team);
    localStorage.setItem(objName,JSON.stringify(all_team_QA_pairs_obj));
    
    $('#qTableConfirmation').text('Answers saved.');
}

$(document).ready(function(){
    loadTDataPage();

    $('#savePitAnswers').click(savePitAnswers); //button for saving pit answers
});