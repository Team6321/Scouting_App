//credit to w3schools for js tutorials, stackoverflow

function loadTDataPage()
{
    show_TDataModal_Or_IntroText();
    displayTeamRadioList();
    setCookie('currCheckedTeam','',750);
    localStorage.setItem('currCheckedMatch','');

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

        var newItem = "<label><input type=\"radio\" name=\"teamListItem\" value=\"" + teamNumber + "\">" + `${teamNumber}: ${teamName}` + "</label><br>";
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
    localStorage.setItem('currCheckedMatch','');
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
        loadPit();
    } else //function calls for match page
    {
        loadMatch();
    }
    localStorage.setItem('currCheckedMatch','');
}




//Pit stuff
function loadPit()
{
    var season = getCurrSeason();
    var cname = season + ' pitQuestions';
    var event = getCurrEvent();
    var questions = getCookie(cname).split('Ω'); //Ω is separator for questions
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

        var inputHTML = `<input type="text" value="${potentialAnswer}" class="q-input">`; //pot answer is either '' or what is stored
        var newTRHtml = '<tr><td>' + question + '</td><td>' + inputHTML + "</td></tr>";
        
        if ($('#pitQuestionTable').html().indexOf(question) < 0) //if table doesn't already have it
        {
            $('#pitQuestionTable').append(newTRHtml);
        }
    }
}

function savePitAnswers() //onclick for save pit button
{
    //using local storage to save pit answers, one localStorage obj per team per event
    // { '/{season}/{event}/{team}/pit answers' : {{question1}:{answer1}, {question2}:{answer2}...} }
    //local storage obj will hold an array of q/a object pairs

    var season = getCurrSeason();
    var event = getCurrEvent();
    var team = getCurrTeamNumber();

    var all_team_QA_pairs_obj = [];
    $('#pitQuestionTable tr').each(function(){ //for each row
        var question = $(this).find('td:first').text();
        var answer = $(this).find('td:last').find('input').val();

        var pair = {};
        pair[question] = answer;
        if (JSON.stringify(pair).localeCompare('{}') != 0) //first row reads {} as its reading the table header
        {
            all_team_QA_pairs_obj.push(pair);
        }
    });

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
    var questionsArr = getCookie(cname).split('Ω');
    $('#allTeamsPitAnswers').html('');
    $('#allPitAnswersTitle').text(`All Pit Scouting Data for the '${event} event'.`);

    var tableHeader = '<tr><th></th>';
    for (var i = 0; i < questionsArr.length-1; i++)
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
        var newRowHTML = `<tr><td>${team}</td>`;
        var pitObjValue = JSON.parse(localStorage.getItem(keys[j])); //value is an object with more objects inside
        var innerKeys = Object.keys(pitObjValue);

        for (var k = 0; k < innerKeys.length; k++) //starts at 1 because first value is blank, it reads the table header
        {
            var pair = pitObjValue[k];
            var key = Object.keys(pair)[0];
            var answer = pair[key];
            newRowHTML += `<td>${answer}</td>`;
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
        $('#matchNumberStuff').hide();
        return;
    }
    $('#matchNumberStuff').show();
    loadMatchNumberList();

    var tableHeader = '<tr> <th><b>Element</b></th> <th><b>Frequency</b></th> </tr>';
    $('#matchQuestionTable').html(tableHeader); //default start of table

    //retrieve elements for current season
    var cname = `/season_config/${season}/` //starter bit of season_config_name
    var cookieList = document.cookie.split(';');

    for (var i = 0; i < cookieList.length; i++)
    {
        var currCName = cookieList[i].trim().split('=')[0];

        if (!(currCName.startsWith(cname))) continue;

        var element = currCName.substring(currCName.lastIndexOf('/')+1);
        var value = getCookie(currCName);

        var inputHTML = `<input type="text" class="q-input">`;
        var elementText = `${element}`;
        var newTRHtml = '<tr><td>' + elementText + '</td><td>' + inputHTML + "</td></tr>";
        
        if ($('#matchQuestionTable').html().indexOf(elementText) < 0) //if table doesn't already have it
        {
            $('#matchQuestionTable').append(newTRHtml);
        }
    }
}

function addNewMatch() //onclick for adding the button to add a match number
{
    var season = getCurrSeason();
    var event = getCurrEvent();
    var team = getCurrTeamNumber();
    var newMatchNum = $('#matchNumberInputBox').val().trim();

    //store match numbers in a local object: {'/season/event/team/match numbers' : " '1','7','20'... "}
    var objName = matchNumberObjName(season,event,team);

    //check if local storage object already has the new match number, stores an array of match numbers
    var storedString = localStorage.getItem(objName);
    var alreadyStored;
    var numsArr = [];
    if (!checkForNull(storedString) || storedString.length == 0) 
    {
        storedString = '';
        alreadyStored = false;
    } else
    {
        numsArr = storedString.split(','); //arr.toString() values seperated by ,
        for (var i = 0; i < numsArr.length; i++)
        {
            var currNum = numsArr[i];
            if (parseInt(currNum) == parseInt(newMatchNum))
            {
                alreadyStored = true;
                break;
            }
        }
    }

    if (alreadyStored)
    {
        $('#matchNumberConfirmation').text('Match number already stored');
        return;
    } //else, new match number

    numsArr.push(newMatchNum);
    storedString = numsArr.toString();
    localStorage.setItem(objName,storedString); //add new match number to arr in local storage obj

    var newItem = `<label><input type="radio" name="matchNumberListItem" value="newMatchNumber">Match ${newMatchNum}</label><br>`;
    $("#matchNumberRadioList").append(newItem); //add to radiolist

    $('.js_clear_on_load').val("").html("");
    $('#matchNumberInputBox').val("").focus();
    $('#matchNumberConfirmation').text(`Match ${newMatchNum} added.`);
}

function saveMatchAnswers()
{
    var season = getCurrSeason();
    var event = getCurrEvent();
    var team = getCurrTeamNumber();
    var match = getCurrMatchNum(season,event,team);

    if (match.trim().length == 0)
    {
        $('#matchTableConfirmation').text('No match selected.');
        return;
    }

    var element_answer_pairs = [];
    $('#matchQuestionTable tr').each(function(){ //for each row
        var element = $(this).find('td:first').text();
        var answer = $(this).find('td:last').find('input').val();

        var pair = {};
        pair[element] = answer;
        if (JSON.stringify(pair).localeCompare('{}') != 0) //first row reads {} as its reading the table header
        {
            element_answer_pairs.push(pair);
        }
    });

    //same thing as pit answers: {'/season/event/team/match' : '{ball:2},{hatch:3}...'}
    var locStrObjName = matchAnswerObjName(season,event,team,match);
    var objVal = JSON.stringify(element_answer_pairs); //arr to string conversion
    localStorage.setItem(locStrObjName,JSON.stringify(element_answer_pairs));

    $('#matchTableConfirmation').text('Answers saved.');
    showAllMatchDataTable();
}

function loadMatchNumberList()
{
    $('#matchNumberRadioList').html('');

    var season = getCurrSeason();
    var event = getCurrEvent();
    var team = getCurrTeamNumber();
    var matchNumsObjName = matchNumberObjName(season,event,team);
    var matchNums = localStorage.getItem(matchNumsObjName);
    var isNull = !checkForNull(matchNums); //check for null returns true if object isnt null

    if (team == 0 || isNull) return;

    var numsArr = matchNums.split(','); //splitting string into csv array
    for (var i = 0; i < numsArr.length; i++)
    {
        var num = numsArr[i];
        var radioButtonHTML = `<label><input type='radio' name='matchNumListItem' value='${num}'>Match ${num}</label><br>`;
        $('#matchNumberRadioList').append(radioButtonHTML);
    }
}

function changeCurrMatchNum() //onchange for curr match number
{
    var teamNum = getCurrTeamNumber();
    var teamName = getCurrTeamName();
    var currMatch = $("input[name=matchNumListItem]:checked","#matchNumberRadioList").val(); //in prev method, val of each radio item is the tNum
    var season = getCurrSeason();
    var event = getCurrEvent();
    var objName = 'currCheckedMatch';
    var objValue = `/${season}/${event}/${teamNum}/${currMatch}`;
    localStorage.setItem(objName,objValue);

    $("#currMatchHeader").text(`Data for Match ${getCurrMatchNum(season,event,teamNum)} for Team ${teamNum}: ${teamName}`);
    $('.js_clear_on_load').val("").html("");

    loadPrevMatchAnswers(season,event,teamNum,currMatch);
    showAllMatchDataTable();
}

function deleteMatchNum() //deletes checked match num, onclick for delete button
{
    var season = getCurrSeason();
    var event = getCurrEvent();
    var team = getCurrTeamNumber();
    
    var matchNum = parseInt(getCurrMatchNum(season,event,team));
    var objName = matchNumberObjName(season,event,team);
    var storedMatchesArr = localStorage.getItem(objName).split(',');
    var newArr = [];
    for (var i = 0; i < storedMatchesArr.length; i++)
    {
        if (parseInt(storedMatchesArr[i]) == matchNum) continue; //skip over checked match num

        newArr.push(storedMatchesArr[i]);
    }
    
    //delete saved match data for that match number
    var matchDataToRemove = matchAnswerObjName(season,event,team,matchNum);
    localStorage.removeItem(matchDataToRemove);
    loadPrevMatchAnswers(season,event,team,matchNum);

    newArr = newArr.toString();
    localStorage.setItem(objName,newArr); //update object
    loadMatchNumberList();
    localStorage.setItem('currCheckedMatch','');

    $('#matchNumberConfirmation').text(`Match ${matchNum} deleted.`);
}

function loadPrevMatchAnswers(season,event,team,match)
{
    var objName = matchAnswerObjName(season,event,team,match);
    var objValue = localStorage.getItem(objName);
    var prevStoredArr = JSON.parse(objValue);
    
    var tableHeader = '<tr> <th><b>Element</b></th> <th><b>Frequency</b></th> </tr>';
    $('#matchQuestionTable').html(tableHeader); //default start of table

    var teamStoredAlready = false
    if (!checkForNull(prevStoredArr))
        teamStoredAlready = true; //else, answers are stored, retrieve those answers

    //go through all saved cookie elements
    var cNameStart = `/season_config/${ season }/`;
    var cookieList = document.cookie.split(';');

    for (var i = 0; i < cookieList.length; i++)
    {
        var currCookie = cookieList[i].trim().split('=');
        if (!(currCookie[0].startsWith(cNameStart))) continue; //else, currCookie stores an element

        var element = currCookie[0].substring(currCookie[0].lastIndexOf('/')+1);

        var prevSavedAnswer = '';
        if (!teamStoredAlready) //won't through 'prevStoredArr is null' error
        {
            for (var j = 0; j < prevStoredArr.length; j++)
            {
                var currPair = prevStoredArr[j];
                var potentialAnswer = currPair[element];
                if (!checkForNull(potentialAnswer)) continue;

                //else, object had a pair with that element name/value, use that instead of '' for input val
                prevSavedAnswer = potentialAnswer;
            }
        }

        var inputHTML = `<input type="text" value='${prevSavedAnswer}' class="q-input">`;
        var elementText = `${element}`;
        var newTRHtml = '<tr><td>' + elementText + '</td><td>' + inputHTML + "</td></tr>";
        
        if ($('#matchQuestionTable').html().indexOf(newTRHtml) < 0) //if table doesn't already have it
        {
            $('#matchQuestionTable').append(newTRHtml);
        }
    }
}

function showAllMatchDataTable()
{
    var season = getCurrSeason();
    var event = getCurrEvent();
    var team = getCurrTeamNumber();
    var match = getCurrMatchNum(season,event,team);
    
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
    var tableHeader = '<tr><th></th>'
    for (var i = 0; i < questionsArr.length; i++)
    {
        tableHeader += `<th>${questionsArr[i]}</th>`;
    }
    tableHeader += '</tr>';
    $('#allMatchAnswers').html(tableHeader);

    //add match data from all saved teams, for the curr checked match
    var keys = Object.keys(localStorage);

    for (var i = 0; i < keys.length; i++)
    {
        var currKey = keys[i];
        if (!currKey.endsWith(`Match ${match}`)) continue;

        var currTeam = currKey.split('/')[3]; //based on matchAnswerObjName structure
        var newRowHTML = `<tr><td>${currTeam}</td>`;
        var currValue = JSON.parse(localStorage.getItem(keys[i]));
        var innerKeys = Object.keys(currValue); //local storage object has element/frequency pair objects inside it

        for (var j = 0; j < innerKeys.length; j++)
        {
            var pair = currValue[j];
            var element = Object.keys(pair)[0];
            var freq = pair[element];
            newRowHTML += `<td>${freq}</td>`
        }

        $('#allMatchAnswers').append(newRowHTML);
    }
    $('#allMatchAnswersTableTitle').text(`All Match Data for Match ${match}.`);
}


$(document).ready(function(){
    loadTDataPage();

    $('#savePitAnswers').click(savePitAnswers); //button for saving pit answers

    $('#matchNumberButton').click(addNewMatch); //button for adding match numbers

    $('#matchTableSubmit').click(saveMatchAnswers); //saving answers to match tables

    $('#deleteMatchNum').click(deleteMatchNum); //deletes checked match num

    const Enter_key_code = 13;
    $('#matchNumberInputBox').keypress(function(e){
        if (e.keyCode == Enter_key_code) addNewMatch();
    });
});

function matchNumberObjName(season,event,team)
{
    return `/${season}/${event}/${team}/match numbers`
}

function pitAnswerObjName(season,event,team)
{
    return `/${season}/${event}/${team}/pit`;
}

function matchAnswerObjName(season,event,team,matchNum)
{
    return `/${season}/${event}/${team}/Match ${matchNum}`;
}

function getCurrMatchNum(season,event,team) //returns number of match
{
    var value = localStorage.getItem('currCheckedMatch');
    if (value.trim().length == 0)
        return '';
    else
    {
        // value is in format /season/event/team/match num
        return value.substring(value.lastIndexOf('/')+1);
    }
}