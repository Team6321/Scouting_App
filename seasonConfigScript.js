//credit to w3schools for js tutorials, stackoverflow

//**********navbar on all pages*************//
//open navbar

function openNav(){
    document.getElementById("mySidenav").style.width= "250px";
}

//closing navbar
function closeNav(){
document.getElementById("mySidenav").style.width="0";
}

//adds new season from input box
function addNewSeason()
{
    var newSeason = $("#newSeasonInputBox").val().trim().toString();

    var isAlreadyStored = false;
    if (document.cookie.length > 0) //if cookies are stored at all
    {
        if (getCookie("seasonList") !== " ")
        {
            var seasonNames = getCookie("seasonList").split("§"); //§ is an uncommon separator that user can't type
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
        var cvalue = getCookie('seasonList') + newSeason + '§';
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
            var seasonList = getCookie('seasonList').split("§");
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
    var currCheckedSeason = getCookie('currCheckedSeason');
    var seasonList = getCookie('seasonList').trim();
    var startIndex = seasonList.indexOf(currCheckedSeason);
    var endIndex = startIndex + currCheckedSeason.length;
    var newText = seasonList.substring(0,startIndex) + seasonList.substring(endIndex+1);
    
    setCookie('seasonList',newText,750); //update season list cookie
    setCookie('currCheckedSeason','',750); //last checked season was deleted, restart that cookie
    deleteAllElements(currCheckedSeason); //clear elements
    deleteCookie(currCheckedSeason + ' pitQuestions'); //clear pit questions cookie
    document.location.reload();
}

//onclick for delete specific element
function deleteSpecificElement()
{
    var elementToDelete = $('#elementToDelete').val().trim();
    var cookieList = document.cookie.split(';');

    var cnameToDelete = '';
    for (var i = 0; i < cookieList.length; i++)
    {
        var currCname = cookieList[i].split('=')[0];
        if (!currCname.endsWith(elementToDelete)) continue;

        cnameToDelete = currCname;
    }
    deleteCookie(cnameToDelete);
    var season = getCookie('currCheckedSeason');
    setTable(season);
    $('#elementToDelete').val('').focus();
}

//after onchange, show saved cookie questions of new season to the text box
function setPitQuestionTextBox(season)
{
    $('#pitScoutingTextBox').val("");
    var allQuestions = getCookie(season + ' pitQuestions').trim().split('Ω');
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
    $("#scoringTable").html('<tr><th><b>Scoring Method</b></th> <th><b>Points Worth</b></th> </tr>');
    var cookieList = document.cookie.split(';');
    for (var i = 0; i < cookieList.length; i++)
    {
        if (cookieList[i].trim().startsWith('/season_config/' + season))
        {
            var elementName = getElementName(cookieList[i]);
            var elementPoints = getElementValue(cookieList[i]);
            //console.log('elementName: ' + elementName);
            //console.log('elementVal: ' + elementPoints);

            var newTRHtml = "<tr><td>" + elementName + 
            "</td><td>" + elementPoints + "</td></tr>";

            if ($('#scoringTable').html().indexOf(newTRHtml) < 0)
            {
                $('#scoringTable').append(newTRHtml);
            }
        } else
        {
            $('#scoringTable').val(" ");
        }
    }
}

function season_config_cookie_name(season,element)
{
    return `/season_config/${ season }/${ element }`;
}


$(document).ready(function()
{
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

    //adds new element to table, handles things like element already exists and season not checked
    $("#scoringSaveButton").click(function()
    {
        var newElementName = $("#elementKey").val().trim();
        var newElementPoints = $("#elementPoints").val().trim();
        
        if (newElementName !== "" || newElementPoints !== "")
        {
            var season = getCookie('currCheckedSeason');//$("input[name=seasonListItem]:checked","#seasonRadioList").val();
            if (season !== " ")
            {
                var cookieName = season_config_cookie_name(season,newElementName);
                var cookieValue = newElementPoints;
                
                var cookieList = document.cookie.split(";");
                var elementAlreadyStored = false;
                for (var i = 0; i < cookieList.length;i++)
                {
                    if (cookieList[i].trim().startsWith('/season_config/' + season))
                    {
                        var str = cookieList[i];
                        var checkerName = str.substring(str.lastIndexOf('/')+1,str.indexOf('='));
                        if (checkerName == newElementName)
                        {
                            elementAlreadyStored = true;
                            break;
                        }
                    }
                }

                $("#elementConfirmationBox").text(" ");
                setCookie(cookieName,cookieValue,750);
                setTable(season);
                $("#elementConfirmationBox").html('<i>Element "' + newElementName + '" added.<\i>');

                $("#elementKey").val("").focus();
                $("#elementPoints").val("");
            } else
            {
                $("#elementConfirmationBox").html("<i>Please check a season.<\i>");
            }
        } else
        {
            $('#elementConfirmationBox').html("<i>Please fill in both fields.<\i>");
        }      
    });


    //reads questions from text box and overwrites whatever is stored
    //in the cookie by what is read from the box
    $("#pitScoutingSubmit").click(function(){
        var allQuestions = $("#pitScoutingTextBox").val().split(/\r?\n/);

        console.log(allQuestions);
        var currSeason = getCookie("currCheckedSeason");
        
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
                        setCookie(cookieName,getCookie(cookieName) + question + 'Ω');
                        
                        var confirmationText = '<i>Questions saved.<\i><br>';
                        $("#pitScoutConfirmationBox").html(confirmationText);
                    }
                }
            }
        }
    });
});