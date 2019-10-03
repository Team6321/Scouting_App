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




//***********season config js***************//

//adds new season from input box
function addNewSeason()
{
    var newSeason = $("#newSeasonInputBox").val().trim().toString();

    var isAlreadyStored = false;
    if (document.cookie.length > 0) //if cookies are stored at all
    {
        if (getCookie("seasonList") !== " ")
        {
            var seasonNames = getCookie("seasonList").split(",");
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
        $("#seasonRadioList").append("<label><input type=\"radio\" name=\"seasonListItem\" value=\"" + newSeason + "\">" + newSeason + "</label><br>"); //add to radiolist

        //save newSeason in cookie
        document.cookie = "seasonList=" + getCookie("seasonList") + newSeason + "," + "; expires=Wed, 1 Jan 2038 12:00:00 UTC; path=/";

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
            var seasonList = getCookie('seasonList').split(",");
            //console.log('seasonList:' + seasonList);
            for (var i=0;i<seasonList.length-1;i++) //length-1 because last will always be "" because name,name,
            {
                var cookieVal = seasonList[i];
                $("#seasonRadioList").append("<label><input type=\"radio\" name=\"seasonListItem\" value=\"" +cookieVal + "\">"+cookieVal+ "</label><br>");
            }
        }
    }

    $("#newSeasonInputBox").val("");
    $("#elementConfirmationBox").html(" ");
    $("#newSeasonConfirmation").html(" ");
    $("#elementKey").val("");
    $("#elementPoints").val("");
}

/*//clears all seasons from radiolist 'formspace' and document.cookies
function clearSeasons()
{
    //clearing all cookies
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) 
    {
        var cookie = cookies[i];
        var name = cookie.split("=")[0].toString().trim();
        console.log("name: " + name);
        deleteCookie(name);
    }
    console.log("document.cookie: " + document.cookie);
    var formSpace = document.getElementById("seasonRadioList");
    formSpace.innerHTML = " ";
}*/

function deleteCookie(name)
{
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC';   
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
    var season = $("input[name=seasonListItem]:checked","#seasonRadioList").val();
    $("#seasonQuestionsTitle").text("Season specific data for \'" + 
    season + "\'.");

    $("#elementsTableTitle").text("Scoring table for season \'" + season + "\'");
    
    $("input[name=seasonListItem]:checked","#seasonRadioList").setCurrCheckedSeason();
    
    $("#scoringTable").html('<tr><th><b>Scoring Method</b></th> <th><b>Points Worth</b></th> </tr>');
    setTable(season);


    $("#elementKey").val("");
    $("#elementPoints").val("");
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
function setTable(seasonChecked)
{
    var cookieList = document.cookie.split(';');
    for (var i = 0; i < cookieList.length; i++)
    {
        if (cookieList[i].trim().startsWith('/season_config/' + seasonChecked))
        {
            var elementName = getElementName(cookieList[i]);
            var elementPoints = getElementValue(cookieList[i]);
            console.log('elementName: ' + elementName);
            console.log('elementVal: ' + elementPoints);

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


$(document).ready(function(){ 
    //sets current checked season of the radiolist in a cookie
    $.fn.setCurrCheckedSeason = function(){
        var currCheckedSeason = this.val();
        if (typeof(currCheckedSeason) !== "undefined")
        {
            document.cookie = "currCheckedSeason="+currCheckedSeason+
            "; expires=Wed, 1 Jan 2038 12:00:00 UTC; path=/";
        }
    };

    function getCurrCheckedSeason($param) {
        var currCheckedSeason = $param.val();
        if (typeof(currCheckedSeason) !== "undefined")
        {
            return currCheckedSeason;
        }
    }

    //if hits enter during season text box, trigger button
    $('#newSeasonInputBox').keypress(function(e){
        if (e.keyCode == 13)
        {
            addNewSeason();
        }
    });

    //if hits enter while entering points, trigger save button
    $('#elementPoints').keypress(function(e){
        if (e.keyCode == 13)
        {
            $('#scoringSaveButton').click();
        }
    });

    //adds new element to table, handles things like element already exists and season not checked
    $("#scoringSaveButton").click(function(){
        var newElementName = $("#elementKey").val().trim().toString();
        var newElementPoints = $("#elementPoints").val().trim();
        
        if (newElementName !== "")
        {
            var season = $("input[name=seasonListItem]:checked","#seasonRadioList").val();
            if (typeof(season) !== "undefined")
            {
                var cookieName = '/season_config/' + season + '/' + newElementName;
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
                
                if (!elementAlreadyStored)
                {
                    $("#elementConfirmationBox").text(" ");
                    document.cookie = cookieName + "=" + cookieValue + 
                    "; expires=Wed, 1 Jan 2038 12:00:00 UTC; path=/";
                    //doc.cookie --> /season_config/season/elementName=elementValue;...

                    var newTRHtml = "<tr><td>" + newElementName + 
                    "</td><td>" + newElementPoints + "</td></tr>";
                    
                    $("#scoringTable").append(newTRHtml);
                    $("#elementConfirmationBox").html('<i>Element "' + newElementName + '" added.<\i>');

                    $("#elementKey").val("");
                    $("#elementPoints").val("");
                } else
                {
                    $("#elementConfirmationBox").html('<i>Element "' + newElementName + '" already exists.<\i>');
                }
            } else
            {
                $("#elementConfirmationBox").html("<i>Please check a season.<\i>");
            }
        }      
    });


    //start of questionnaire js code
    $("#pitScoutingSubmit").click(function(){
        var allQuestions = $("#pitScoutingTextBox").val();
        var questionsArr = allQuestions.split("\n");

        var currSeason = getCookie("currCheckedSeason");
        console.log(currSeason);
        //console.log(currSeason);
        //console.log(questionsArr);
        
        if (currSeason === "null")
        {
            $("#pitScoutConfirmationBox").html("<i>Please check a season.<\i>");
        } else
        {
            for (var i = 0; i < 1;i++)
            {
                // pit scouting cookies should be in the format:
                // (currCheckedSeason) pitScout Q(i): question; expiry date...
                var question = questionsArr[i].toString();
                if (question != "")
                {
                    document.cookie =  currSeason + " pitScout Q"+i+":" + question +
                    "; expires=Wed, 1 Jan 2038 12:00:00 UTC; path=/";
                }
            }
        }
    });
});