//credit to w3schools for js tutorials, stackoverflow

function loadTDataPage()
{
    show_TDataModal_Or_IntroText();
    displayTeamRadioList();
    setCookie('currCheckedTeam','',750);

    $('.js_clear_on_load').val("").html("");
    
    $('#matchTab').on('click', function(event) { //by default, open match tab
        displayTabContent(event,'matchTabContent');
    });
    $('#matchTab').trigger('click');
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
        var season = getCurrSeason();
        introText = `Here, you can enter and view answers to ` +
        `pit scouting questions entered on the Season Configuration page. You can also add and view data from matches including game ` +
        `element stats and custom notes."${season}".`;
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
    var season = getCurrSeason();
    var event = getCurrEvent();
    if (season.trim().length == 0 || event.trim().length == 0) return;

    var teamsJSON = getTeams(season,event);
    var keys = Object.keys(teamsJSON);
    for (var i = 0; i < keys.length; i++)
    {
        var teamNumber = keys[i];
        var teamName = teamsJSON[teamNumber];

        var newItem = `<label><input type='radio' name='teamListItem' value='${teamNumber}'>${teamNumber}: ${teamName}</label><br>`;
        $("#teamRadioList").append(newItem); //add to radiolist
    }
}

//onchange for the team radio list
function changeCurrTeam()
{
    var currTeamNumber = $("input[name=teamListItem]:checked","#teamRadioList").val(); //in prev method, val of each radio item is the tNum
    var currSeason = getCurrSeason();
    var currEvent = getCurrEvent();
    var cname = 'currCheckedTeam';
    var currTeamName = getTeams(currSeason,currEvent)[currTeamNumber];

    if (currSeason.trim().length == 0 || currEvent.trim().length==0 || currTeamNumber == 0)
    {
        $("#teamStatsTitle").text('');
        return;
    }

    var cvalue = `/${currSeason}/${currEvent}/${currTeamNumber}`;
    setCookie(cname,cvalue,750);     //curr team cookie --> currCheckedTeam = /{season}/{event}/{currTeamNumber}

    $("#teamStatsTitle").text(`Data for team ${currTeamNumber} : ${currTeamName}`);
    $('#pitScoutingTitle').text(`Pit Scouting Questions and Answers for team ${currTeamNumber}: ${currTeamName}`);
    $('.js_clear_on_load').val("").html("");

    loadPit();
    loadMatch();
}

//basically copy pasted from w3schools, onclick for a change in tabs
function displayTabContent(evt, tabName)
{
    $('.tabContent').hide();
    $('.tabs').removeClass('w3-bottombar-gold').addClass('w3-bottombar-maroon');
    $('#' + tabName).show();
    evt.currentTarget.firstElementChild.className += " w3-bottombar-gold";

    if (tabName.startsWith('pit')) //function calls for pit page
    {
        $('.js_clear_on_load').val('').html('');
        loadPit();
    } else //function calls for match page
    {
        loadMatch();
    }
}



//Pit stuff
function loadPit()
{
    var season = getCurrSeason();
    var cname = season + ' pitQuestions';
    var event = getCurrEvent();
    var questions = getCookie(cname).split(COOKIE_QUESTION_SEPARATOR);
    var currTeam = getCurrTeamNumber();

    showAllPitDataTable();
    if (currTeam == 0)
    {
        $('#pitQuestionTable').html('');
        $('#pitTableConfirmation').text('No team selected.');
        return;
    }

    var tableHeader = '<tr> <th><b>Question</b></th> <th><b>Answer</b></th> </tr>';
    $('#pitQuestionTable').html(tableHeader); //default start of table

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

        var inputHTML = `<input type="text" value="${potentialAnswer}" class="answer">`; //pot answer is either '' or what is stored
        var newTRHtml = `<tr><td class='question scoutingTableRow'>${question}</td><td class='scoutingTableRow'>${inputHTML}</td></tr>`;
        
        $('#pitQuestionTable').append(newTRHtml);
    }
}

function savePitAnswers() //onclick for save pit button
{
    //using local storage to save pit answers, one localStorage obj per team per event
    // { '/{season}/{event}/{team}/pit answers' : {{question1}:{answer1}, {question2}:{answer2}...} }
    //local storage obj will hold an array of q/a object pairs

    $('#pitTableConfirmation').text('Saving...');
    var season = getCurrSeason();
    var event = getCurrEvent();
    var team = getCurrTeamNumber();

    var all_team_QA_pairs_obj = [];
    var areAnyFieldsBlank = false;

    $('#pitQuestionTable tr').each(function(){ //for each row
        var question = $(this).find('.question').text();
        var answer = $(this).find('.answer').val();

        if (typeof(answer) != 'undefined') //if its not the header and is really blank
        {
            if (answer.trim().length == 0)
            {
                areAnyFieldsBlank = true;
            }
        }
        var pair = {};
        pair[question] = answer;
        if (JSON.stringify(pair) != '{}') //first row reads {} as its reading the table header
        {
            all_team_QA_pairs_obj.push(pair);
        }
    });

    if (areAnyFieldsBlank)
    {
        $('#pitTableConfirmation').text('Please enter data for all fields.');
        return;    
    }

    var objName = pitAnswerObjName(season,event,team);
    localStorage.setItem(objName,JSON.stringify(all_team_QA_pairs_obj));
    
    $('#pitTableConfirmation').text('Answers saved.');
    showAllPitDataTable();
}

function showAllPitDataTable() //shows pit stats of all teams for the current event in one table
{
    var season = getCurrSeason();
    var event = getCurrEvent();
    var cname = season + ' pitQuestions';
    var questionsArr = getCookie(cname).split('Ω').slice(0,-1); //first element to second to last element of .split arr
    $('#allTeamsPitAnswers').html('');
    $('#allPitAnswersTitle').text(`All Pit Scouting Data for the '${event}' event.`);

    var tableHeader = '<tr><th class="allTeamsRow">Team #</th>'; //top-left most cell
    for (var i = 0; i < questionsArr.length; i++)
    {

        tableHeader += `<th>${questionsArr[i]}</th>`;
    }
    tableHeader += '</tr>'; //end of row
    $('#allTeamsPitAnswers').html(tableHeader); //default start of table

    var keys = Object.keys(localStorage);
    for (var j = 0; j < keys.length; j++) //iterate through localStorage objects
    {
        if (!keys[j].endsWith('pit')) continue;

        var team = keys[j].split('/')[3]; //based on structure of pitStorageObjName
        var newRowHTML = `<tr><td class='allTeamsRow'>${team}</td>`;
        var pitObjValue = JSON.parse(localStorage.getItem(keys[j])); //value is an object with more objects inside
        var innerKeys = Object.keys(pitObjValue);

        for (var k = 0; k < innerKeys.length; k++) //starts at 1 because first value is blank, it reads the table header
        {
            var pair = pitObjValue[k];
            var key = Object.keys(pair)[0];
            var answer = pair[key];
            newRowHTML += `<td class='allTeamsRow'>${answer}</td>`;
        }
        //newRowHTML += '</tr>' //end of row

        $('#allTeamsPitAnswers').append(newRowHTML);
    }
}



//Match Stuff
function loadMatch()
{
    $('#currMatchHeader').text('');
    var season = getCurrSeason();
    var event = getCurrEvent();
    var teamNum = getCurrTeamNumber();

    if (teamNum == 0)
    {
        $('#matchTableConfirmation').text('No Team selected.');
        return;
    }

    var tableHeader = '<tr> <th><b>Element</b></th> <th><b>Frequency/Answer</b></th> </tr>';
    $('#matchQuestionTable').html(tableHeader); //default start of table

    //retrieve elements for current season
    var cname = `/season_config/${season}/` //starter bit of season_config_name
    var cookieList = document.cookie.split(';');

    var matchInputHTML = `<input type="number" class="matchNumInput match-frequency js_clear_on_load">`;
    var matchRow = `<tr> <td class="match-element scoutingTableRow">Match #</td> <td class="scoutingTableRow">${matchInputHTML}</td> </tr>`;
    $('#matchQuestionTable').append(matchRow); //default for all teams: row for inputting what match it was
    for (var i = 0; i < cookieList.length; i++)
    {
        var currCName = cookieList[i].trim().split('=')[0];

        if (!(currCName.startsWith(cname))) continue;

        var element = currCName.substring(currCName.lastIndexOf('/')+1);
        var value = getCookie(currCName);

        var inputHTML = `<input type="number" class="match-frequency js_clear_on_load">`;
        var elementText = `${element}`;
        var newTRHtml = `<tr><td class='match-element scoutingTableRow'>${elementText}</td><td class='scoutingTableRow'>${inputHTML}</td></tr>`;
        
        $('#matchQuestionTable').append(newTRHtml);   
    }
    showAllMatchDataTable();
}

function saveMatchAnswers()
{
    $('#matchTableConfirmation').text('Saving...');
    var season = getCurrSeason();
    var event = getCurrEvent();
    var team = getCurrTeamNumber();

    var match = 0;
    var element_answer_pairs = [];
    var areAnyFieldsBlank = false;

    $('#matchQuestionTable tr').each(function(){ //for each row
        var potentialMatchNum = $(this).find('.matchNumInput').val(); //for first row, which is always the match num
        if (typeof(potentialMatchNum) !== 'undefined')
        {
            match = potentialMatchNum;
        }

        var element = $(this).find('.match-element').text();
        var answer = $(this).find('.match-frequency').val();

        if (typeof(answer) != 'undefined') //if its not the header and is really blank
        {
            if (answer.trim().length == 0)
            {
                areAnyFieldsBlank = true;
            }
        }
        var pair = {};
        pair[element] = answer;
        if (JSON.stringify(pair) != '{}') //first row reads {} as its reading the table header
        {
            element_answer_pairs.push(pair);
        }
    });

    if (areAnyFieldsBlank)
    {
        $('#matchTableConfirmation').text('Please enter data for all fields.');
        return;
    }

    //same thing as pit answers: {'/season/event/team/match' : '{ball:2},{hatch:3}...'}
    var locStrObjName = matchAnswerObjName(season,event,team,match);
    var objVal = JSON.stringify(element_answer_pairs); //arr to string conversion
    localStorage.setItem(locStrObjName,JSON.stringify(element_answer_pairs));

    $('#matchTableConfirmation').text('Answers saved.');
    $('.js_clear_on_load').val('');
    showAllMatchDataTable()
}


function showAllMatchDataTable()
{
    var season = getCurrSeason();
    var event = getCurrEvent();
    var team = getCurrTeamNumber();
    
    //get all elements in an array
    var questionsArr = [];
    var cNameStart = `/season_config/${ season }/`;
    var cookieList = document.cookie.split(';');
    for (var i = 0; i < cookieList.length; i++)
    {
        if (!cookieList[i].trim().startsWith(cNameStart)) continue;
        var currCName = cookieList[i].trim().split('=')[0];
        var element = currCName.substring(currCName.lastIndexOf('/')+1);
        questionsArr.push(element);
    }

    //default the table (make it blank and start with the header)
    var tableHeader = '<tr><th class="allTeamsRow">Team #</th> <th>Match #</th>'
    for (var i = 0; i < questionsArr.length; i++)
    {
        tableHeader += `<th>${questionsArr[i]}</th>`;
    }
    tableHeader += '</tr>';
    $('#allMatchAnswers').html(tableHeader);

    //add match data from all saved teams, for the curr checked match
    var keys = Object.keys(localStorage);

    sortMatchOutputTable(keys);
}

function sortMatchOutputTable(savedLocStrKeys) //sorts the table by team and then displays the output
{
    var season = getCurrSeason();
    var event = getCurrEvent();

    //get array of team numbers for current event
    var teamsObject = getTeams(season,event);
    var teamsKeys = Object.keys(teamsObject);
    for (var i = 0; i < teamsKeys.length; i++) //iterate through teams attending currEvent
    {
        var currTeam = teamsKeys[i];

        //for each team, if there is any data saved, display it
        for (var j = 0; j < savedLocStrKeys.length; j++)
        {
            var currKey = savedLocStrKeys[j];
            if (!currKey.includes('Match Data')) continue;

            if (!currKey.includes(currTeam)) continue;

            //now, since the team matches, display each one
            var currValue = JSON.parse(localStorage.getItem(currKey));
            var innerKeys = Object.keys(currValue);

            var newRowHTML = `<tr><td class="allTeamsRow">${currTeam}</td>`;

            for (var k = 0; k < innerKeys.length; k++) //displaying answers to each question
            {
                var pair = currValue[k];
                var element = Object.keys(pair)[0]; //pair has only 1 element/value
                var freq = pair[element];
                newRowHTML += `<td class="allTeamsRow">${freq}</td>`
            }

            $('#allMatchAnswers').append(newRowHTML);
        }
    }
    $('#allMatchAnswersTableTitle').text(`All Match Data for the ${event} event.`);
}


$(document).ready(function(){
    loadTDataPage();

    $('#savePitAnswers').click(savePitAnswers); //button for saving pit answers

    $('#matchTableSubmit').click(saveMatchAnswers); //saving answers to match tables
});

function pitAnswerObjName(season,event,team)
{
    return `/${season}/${event}/${team}/pit`;
}

function matchAnswerObjName(season,event,team,matchNum)
{
    return `/${season}/${event}/${team}/Match Data/${matchNum}`;
}