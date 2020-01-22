//credit to w3schools for js tutorials, stackoverflow

//adds new season from input box
function addNewSeason()
{
    var newSeason = $("#newSeasonInputBox").val().trim().toString();

    if (newSeason == '') return;

    var isAlreadyStored = false;
    if (document.cookie.length > 0) //if cookies are stored at all
    {
        if (getCookie("seasonList").trim().length > 0)
        {
            var seasonNames = getCookie("seasonList").split(SEASON_LIST_SEPARATOR);
            for (var i=0;i<seasonNames.length;i++)
            {
                var val = seasonNames[i].trim();
                if (newSeason==val.toString())
                {
                    isAlreadyStored = true;
                    break;
                }
            }
        }
    }

    if (isAlreadyStored) //if season is already stored
    {
        $("#newSeasonConfirmation").html("<i>Season \'" + newSeason +"\' already exists.</i>");    
    } else
    {
        //add to radioList
        $("#newSeasonConfirmation").html("<i>Season " + "\'"+ newSeason +"\'"+" has been added.</i>"); //confirmation text
        $("#seasonRadioList").append("<label><input type=\"radio\" name=\"seasonListItem\" value=\"" + newSeason + "\">" + newSeason +"</label><br>"); //add to radiolist

        //save newSeason in cookie
        var cname = 'seasonList';
        var cvalue = getCookie('seasonList') + newSeason + SEASON_LIST_SEPARATOR;
        setCookie(cname,cvalue,750);

        $("#newSeasonInputBox").val("");
    }
}

//meant for only the startup of the page
function loadSeasons()
{
    if (document.cookie.length > 0)
    {
        if (getCookie("seasonList") !== " ")
        {
            var seasonList = getCookie('seasonList').split(SEASON_LIST_SEPARATOR);
            //console.log('seasonList:' + seasonList);
            for (var i=0;i<seasonList.length-1;i++) //length-1 because last will always be "" because name,name,
            {
                var cookieVal = seasonList[i];
                if (!$('#seasonRadioList').html().includes(cookieVal))
                {
                    $("#seasonRadioList").append("<label><input type=\"radio\" name=\"seasonListItem\" value=\"" +cookieVal + "\">"+cookieVal + "</label><br>");
                }
            }
        }
    }

    $('.js_clear_on_load').val("").html("");
    setCookie('currCheckedSeason','',750);
}

//sets titles for different sections and adds checked season to cookie
//onchange function for season radio list
function seasonSubmit()
{
    //var season = $(`input[name=seasonListItem][value="${ currentSeason }"]`).attr('checked', true);
    var season = $("input[name=seasonListItem]:checked","#seasonRadioList").val();
    $("#seasonQuestionsTitle").text("Season specific data for \'" + 
    season + "\'.");

    $("#elementsTableTitle").text("Scoring table for season \'" + season + "\'");
    
    $("input[name=seasonListItem]:checked","#seasonRadioList").setCurrCheckedSeason();
    
    $("#scoringTable").html('<tr><th><b>Scoring Method</b></th> <th><b>Points Worth</b></th> </tr>');
    setTable(season);


    $("#elementKey").val("");
    $("#elementPoints").val("");
    $("#pitScoutConfirmationBox").html("");
    setPitQuestionTextBox(season);
}

function deleteCheckedSeason()
{
    var currCheckedSeason = getCurrSeason();
    var seasonList = getCookie('seasonList').trim();
    var startIndex = seasonList.indexOf(currCheckedSeason);
    var endIndex = startIndex + currCheckedSeason.length;
    var newText = seasonList.substring(0,startIndex) + seasonList.substring(endIndex+1);
    
    setCookie('seasonList',newText,750); //update season list cookie
    setCookie('currCheckedSeason','',750); //last checked season was deleted, restart that cookie
    deleteCookie(currCheckedSeason + ' pitQuestions'); //clear pit questions cookie
    document.location.reload();
}

//onclick for delete specific element
function deleteSpecificElement()
{
    var elementToDelete = $('#elementToDelete').val().trim();
    var cookieList = document.cookie.split(';');
    if (elementToDelete === '') return;

    var cnameToDelete = '';
    for (var i = 0; i < cookieList.length; i++)
    {
        var currCname = cookieList[i].split('=')[0];
        if (!currCname.endsWith(elementToDelete)) continue;

        cnameToDelete = currCname;
    }
    deleteCookie(cnameToDelete);
    var season = getCurrSeason();
    setTable(season);
    $('#elementToDelete').val('').focus();
}

//after onchange, show saved cookie questions of new season to the text box
function setPitQuestionTextBox(season)
{
    $('#pitScoutingTextBox').val("");
    var allQuestions = getCookie(season + ' pitQuestions').trim().split(COOKIE_QUESTION_SEPARATOR);
    for (var i = 0; i < allQuestions.length;i++)
    {
        var question = allQuestions[i].trim();
        var currText = $("#pitScoutingTextBox").val();
        if (i != allQuestions.length-1)
            $("#pitScoutingTextBox").val(currText + question + '\n');
        else
            $("#pitScoutingTextBox").val(currText + question); //no newline after last output line
    }
    
    if ($("#pitScoutingTextBox").val() === '\n') //clearing newlines after onchange event
    {
        $("#pitScoutingTextBox").val("");
    }
}

function getElementName(str)
{
    // /season_config/season/elementName=elementValue
    return str.substring(str.lastIndexOf('/')+1,str.indexOf('='));
}

function getElementValue(str)
{
    return str.split('=')[1].toString();
}

//updates table based on cookies from checked season
function setTable(season)
{
    $("#scoringTable").html('<tr><th><b>Scoring Method</b></th> <th><b>Points Worth</b></th> <th><b>Input Type</b></th> </tr>'); //default the table to the header
    var cookieName = season_config_cookie_name(season);
    var cookieValueObject = JSON.parse(getCookie(cookieName)); //parse object with element/points key/value pairs
    var elementKeys = Object.keys(cookieValueObject);

    for (var i = 0; i < elementKeys.length; i++) //iterate through elements
    {
        var currElement = elementKeys[i];
        var nestedObject = cookieValueObject[currElement]; //points and input value are in a nested object
        
        var currPoints = nestedObject['points'];
        var inputType = nestedObject['inputType'];

        var newTRHtml = `<tr><td>${currElement}</td><td>${currPoints}</td><td>${inputType}</td></tr>`;
        $('#scoringTable').append(newTRHtml);
    }
}

function season_config_cookie_name(season)
{
    return `/season_config/${ season }/elements`;
}

function saveElement()
{
    var newElementName = $("#elementKey").val().trim();
    var newElementPoints = $("#elementPoints").val().trim();
    var elementInputType = $('#elementInputTypeSelect').val();
    var season = getCurrSeason();
    
    if (newElementName === "" || newElementPoints === "" || elementInputType == '0') //if any fields are blank
    {
        $('#elementConfirmationBox').html("<i>Please fill in all fields and select the proper input type.<\i>");
        return;
    } else if (season.trim().length == 0) //if season isn't checked
    {
        $("#elementConfirmationBox").html("<i>Please check a season.<\i>");
        return;
    }

    var cookieName = season_config_cookie_name(season); //get cookie name
    var cookieValueString = getCookie(cookieName); 
    var storedObject = (cookieValueString.trim().length==0) ? {}:JSON.parse(cookieValueString); //empty object if string is empty, if not, JSON parse it
    
    //object needs to have points AND input type, solved with a nested object
    var objValue = {};
    objValue['points'] = newElementPoints;
    objValue['inputType'] = $('#elementInputTypeSelect').val(); //will say 'numeric' or 'text'
    storedObject[newElementName] = objValue; //assign new key/value pair to object

    $("#elementConfirmationBox").text(" ");
    setCookie(cookieName,JSON.stringify(storedObject),750);
    setTable(season);
    $("#elementConfirmationBox").html('<i>Element "' + newElementName + '" added.<\i>');

    $("#elementKey").val("").focus();
    $("#elementPoints").val("");
}


$(document).ready(function()
{
    loadSeasons();
        //sets current checked season of the radiolist in a cookie
    $.fn.setCurrCheckedSeason = function(){
        var currCheckedSeason = this.val();
        if (typeof(currCheckedSeason) !== "undefined")
        {
            setCookie('currCheckedSeason',currCheckedSeason,750);
            //document.cookie = "currCheckedSeason="+currCheckedSeason+
            //"; expires=Wed, 1 Jan 2038 12:00:00 UTC; path=/";
        }
    };

    const Enter_key_code = 13;
    $('#newSeasonInputBox').keypress(function(e){
        if (e.keyCode == Enter_key_code) addNewSeason();
    });

    $('#elementPoints').keypress(function(e){
        if (e.keyCode == Enter_key_code) $('#scoringSaveButton').click();
    });
    
    $('#elementToDelete').keypress(function(e){
        if (e.keyCode == Enter_key_code) deleteSpecificElement();
    });

    //adds new element to object stored in cookie and updates the table
    $("#scoringSaveButton").click(saveElement);


    //reads questions from text box and overwrites whatever is stored
    //in the cookie by what is read from the box
    $("#pitScoutingSubmit").click(function(){
        var allQuestions = $("#pitScoutingTextBox").val().split(/\r?\n/);

        console.log(allQuestions);
        var currSeason = getCurrSeason();
        
        if (currSeason === "null" || currSeason ===" ")
        {
            $("#pitScoutConfirmationBox").html("<i>Please check a season.<\i>");
        } else
        {
            var cookieName = currSeason + " pitQuestions";

            //overwrite whatever is there already
            setCookie(cookieName,"");
            for (var i = 0; i < allQuestions.length;i++)
            {
                var question = allQuestions[i].toString();
                if (question != "")
                {
                    if (!cookieName.includes(question))
                    {
                        //cookie --> {season} questions = {q1}Ω{q2}Ω{q3}
                    
                        //Ω is a character that most users can't enter,separator
                        setCookie(cookieName,getCookie(cookieName) + question + COOKIE_QUESTION_SEPARATOR);
                        
                        var confirmationText = '<i>Questions saved.<\i><br>';
                        $("#pitScoutConfirmationBox").html(confirmationText);
                    }
                }
            }
        }
    });
});