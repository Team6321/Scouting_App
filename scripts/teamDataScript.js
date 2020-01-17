//credit to w3schools for js tutorials, stackoverflow

function loadTDataPage()
{
    show_TDataModal_Or_IntroText();
    displayTeamSelectList();
    setCookie('currCheckedTeam','',750);

    $('.js_clear_on_load').val("").html("");
    
    $('#matchTab').on('click', function(event) { //by default, open match tab
        displayTabContent(event,'matchTabContent');
        showAllMatchDataTable();
    });
    showAllPitDataTable();
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

function displayTeamSelectList()
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

        var newItem = `<option value='${teamNumber}'>${teamNumber}: ${teamName}</option>`
        $("#teamSelectList").append(newItem); //add to selectlist
    }
}

//onchange for the team select list
function changeCurrTeam()
{
    var currTeamNumber = $('#teamSelectList').val();
    var currSeason = getCurrSeason();
    var currEvent = getCurrEvent();
    var cname = 'currCheckedTeam';
    var currTeamName = getTeams(currSeason,currEvent)[currTeamNumber];

    if (currSeason.trim().length == 0 || currEvent.trim().length==0 || currTeamNumber == 0) //0 if select text is 'Choose a team:'
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
    var questions = getCookie(cname).split(COOKIE_QUESTION_SEPARATOR).slice(0,-1);
    var currTeam = getCurrTeamNumber();

    showAllPitDataTable();
    if (currTeam == 0)
    {
        $('#pitQuestionTableHeader').html('');
        $('#pitQuestionTableBody').html('');
        $('#pitTableConfirmation').text('No team selected.');
        return;
    }

    var tableHeader = '<div class="w3-col m6 s12 w3-center"> <h4>Question</h4> </div>'+
                        '<div class="w3-col m6 s12 w3-center"> <h4>Answer</h4> </div>';
    $('#pitQuestionTableHeader').html(tableHeader); //default start of table

    $('#pitQuestionTableBody').html('');
    var localStorageObjName = pitAnswerObjName(season,event,currTeam);
    var team_QA_pairs = JSON.parse(localStorage.getItem(localStorageObjName)); //get QA pairs that may/may not have already been stored
    
    var alreadyStored = false;
    var QA_keys = [];
    if (checkForNull(team_QA_pairs)) //if data is stored
    {
        alreadyStored = true;
        QA_keys = Object.keys(team_QA_pairs);
    }

    for (var i = 0; i < questions.length; i++) //iterate through questions array in cookie
    {
        var question = questions[i];
        var answer = ''; //default, in case something is stored
        if (alreadyStored)
        {
            if (QA_keys.includes(question)) //if answer is saved for it yet
            {
                answer = team_QA_pairs[question];
            }
        }

        var classText = 'w3-col l6 w6 s12 question'; 
        var inputHTML = `<textarea width='80%' style='resize:vertical' value='${answer}' class='answer'>${answer}</textarea>`; //textarea
        var insideHtml = `<div class='${classText}'><h4>${question}</h4></div> <div class='${classText}'>${inputHTML}</div>`; //both divs
        
        var w3RowClassText = 'w3-row scoutingTableRow tableBorders tableBorders-NoTop';

        //only put a top border on the first question row for styling: making sure top/bottom borders dont overlap for non-first rows
        var newTRHtml = `<div class='${w3RowClassText}'> ${insideHtml} </div>`;

        $('#pitQuestionTableBody').append(newTRHtml);
    }

    //update size of pit textareas based on text height
    autosize($('.answer'));
}

function savePitAnswers() //onclick for save pit button
{
    //dictionary with key:value being question:answer

    $('#pitTableConfirmation').text('Saving...');
    var season = getCurrSeason();
    var event = getCurrEvent();
    var team = getCurrTeamNumber();

    var all_team_QA_pairs_obj = {};
    var areAnyFieldsBlank = false;

    $('#pitQuestionTableBody .w3-row').each(function(){ //each w3-row has 2 divs with a h4 and a textarea underneath them, respectively
        var question = $(this).find('.question').text();
        var answer = $(this).find('.answer').val();

        if (question == 'Question') //if first row is the table Header
        {
            continue;
        }

        if (typeof(answer) != 'undefined') //if its not the header and is really blank
        {
            if (answer.trim().length == 0)
            {
                areAnyFieldsBlank = true;
            }
        }
        
        all_team_QA_pairs_obj[question] = answer;
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
    var questionsArr = getCookie(cname).split(COOKIE_QUESTION_SEPARATOR).slice(0,-1); //first element to second to last element of .split arr
    
    var initialTableHTML = '<tr class="teamRow"><th class="allPitTableHeader">Team #</th></tr>';
    $('#allTeamsPitAnswers').html(initialTableHTML);
    $('#allPitAnswersTitle').text(`All Pit Scouting Data for the ${event} event.`);

    //adding initial rows with question headers
    for (var i = 0; i < questionsArr.length; i++) //for each question
    {
        var questionWithNoSpaces = stripAlphaNumerics(questionsArr[i]);
        var questionHeaderHTML = `<th class="allPitTableHeader">${questionsArr[i]}</th>`;
        var newRowHTML = `<tr class='${questionWithNoSpaces}'>${questionHeaderHTML}</tr>`; //the question is one of the classes (w/o whitespaces), will help with adding team data
        $('#allTeamsPitAnswers').append(newRowHTML);
    }


    //adding team data
    var keys = Object.keys(localStorage);
    var pitNameStarter = `/${season}/${event}/`; //ensures that only teams in curr season/event appear
    for (var j = 0; j < keys.length; j++) //iterate through localStorage objects
    {
        if (!keys[j].endsWith('pit') || !keys[j].startsWith(pitNameStarter)) continue;

        var team = keys[j].split('/')[3]; //based on structure of pitStorageObjName
                
        //add the team # to the team row
        var initialTeamCell = `<td>Team ${team}</td>`;
        $('#allTeamsPitAnswers .teamRow').append(initialTeamCell);

        //add rest of team values in current object
        var pitObjValue = JSON.parse(localStorage.getItem(keys[j])); //value is an object with more objects inside
        var innerKeys = Object.keys(pitObjValue);
        
        for (var k = 0; k < innerKeys.length; k++)
        {
            var question = innerKeys[k];
            var answer = pitObjValue[question];
            newCellHTML = `<td>${answer}</td>`;

            //row class is the question
            var questionWithNoSpaces = stripAlphaNumerics(question);
            $(`#allTeamsPitAnswers .${questionWithNoSpaces}`).append(newCellHTML);
        }
    }
}

//removes all whitespace inside a string and returns the result
function stripAlphaNumerics(string)
{
    return string.replace(/\W/g, '');
}



//Match Stuff
function loadMatch()
{
    showAllMatchDataTable();
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
    var customNotesInputHTML = `<input type="text" class="match-frequency js_clear_on_load">`; //for custom notes each match
    var customNotesRow = `<tr> <td class="match-element scoutingTableRow">Custom Notes</td> <td class="scoutingTableRow">${customNotesInputHTML}</td> </tr>`;
    $('#matchQuestionTable').append(customNotesRow);
}

function saveMatchAnswers()
{
    $('#matchTableConfirmation').text('Saving...');
    var season = getCurrSeason();
    var event = getCurrEvent();
    var team = getCurrTeamNumber();

    var match = 0;
    var element_answer_pairs = {};
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
            if (answer.trim().length == 0 && element != 'Custom Notes') //custom notes is not a required answer, just a feature
            {
                areAnyFieldsBlank = true;
            }
        }

        if (element != 'Element') //first row reads 'Element' as its reading the table header
        {
            element_answer_pairs[element] = answer;
        }
    });

    if (areAnyFieldsBlank)
    {
        $('#matchTableConfirmation').text('Please enter data for all fields.');
        return;
    }

    //same thing as pit answers: {'/season/event/team/match' : '{ball:2},{hatch:3}...'}
    var locStrObjName = matchAnswerObjName(season,event,team,match);
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
    var startOfTable = '<tr class="teamRow"><th class="allMatchTableHeader">Team #</th></tr> <tr class="matchRow"><th class="allMatchTableHeader">Match #</th></tr>';
    $('#allMatchAnswers').html(startOfTable);

    for (var i = 0; i < questionsArr.length; i++)
    {
        var elementWithNoSpaces = stripAlphaNumerics(questionsArr[i]);
        var newRow = `<tr class='${elementWithNoSpaces}'><th class="allMatchTableHeader">${questionsArr[i]}</th></tr>`;
        $('#allMatchAnswers').append(newRow);
    }
    $('#allMatchAnswers').append('<tr class="customNotesRow"><th class="allMatchTableHeader">Custom Notes</th></tr>'); //for custom notes

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

            var newCellHTML = `<td>${currTeam}</td>`;
            $('#allMatchAnswers .teamRow').append(newCellHTML);

            for (var k = 0; k < innerKeys.length; k++) //displaying answers to each question
            {
                var element = innerKeys[k];
                var freq = currValue[element];

                if (element == 'Match #') //if its reading a match num
                {
                    $(`#allMatchAnswers .matchRow`).append(`<td>${freq}</td>`);    
                } else if (element == 'Custom Notes') //if its reading a custom notes section
                {
                    $(`#allMatchAnswers .customNotesRow`).append(`<td>${freq}</td>`);    
                } else //just a regular element/answer
                {
                    var elementOnlyAlphaNum = stripAlphaNumerics(element);
                    newCellHTML = `<td>${freq}</td>`;
                    $(`#allMatchAnswers .${elementOnlyAlphaNum}`).append(newCellHTML);
                }
            }
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