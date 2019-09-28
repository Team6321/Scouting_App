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
    var newSeason = document.getElementsByName("newSeasonInputBox")[0].value.trim().toString();

    var cookieList = document.cookie.split(";");
    var isAlreadyStored = false;
    if (document.cookie.length > 0)
    {
        for (var i=0;i<cookieList.length;i++)
        {
            var val = cookieList[i].split("=")[1].trim();
            var cName = cookieList[i].split("=")[0].trim();
            if (cName.trim().startsWith("season:"))
            {
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
        document.getElementById("newSeasonConfirmation").innerHTML=
        "<i>Season \'" + newSeason +"\' already exists.</i>";    
    } else
    {
        //add to radioList
        document.getElementById("newSeasonConfirmation").innerHTML=
        "<i>Season " + "\'"+ newSeason +"\'"+" has been added.</i>"; //confirmation text
        var formSpace = document.getElementById("seasonRadioList");
        //formSpace.innerHTML += "<input type=\"radio\" name=\"seasonListItem\"> " + newSeason + "<br>"; //add to radiolist
        formSpace.insertAdjacentHTML("afterbegin","<input type=\"radio\" name=\"seasonListItem\" value=\"" + newSeason + "\">" + newSeason + "<br>"); //add to radiolist

        //save newSeason in cookie
        document.cookie = "season:" + newSeason + "=" + newSeason + "; expires=Wed, 1 Jan 2038 12:00:00 UTC; path=/";
    }
}

//meant for only the startup of the page
function loadSeasons()
{
    var formSpace = document.getElementById("seasonRadioList");
    if (document.cookie.length != 0)
    {
        var cookieList = document.cookie.split(";");
        for (var i=0;i<cookieList.length;i++)
        {
            var cookieName = cookieList[i].split("=")[0].trim();
            var cookieVal = cookieList[i].split("=")[1].trim();
            if (cookieName.startsWith("season:"))
            {
                formSpace.insertAdjacentHTML("afterbegin","<input type=\"radio\" name=\"seasonListItem\" value=\"" +cookieVal + "\">"+cookieVal+ "<br>");
            }
            //formSpace.innerHTML += "<input type=\"radio\" name=\"seasonListItem\"> " + cookieVal + "<br>";
        }
    }
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
    return (value != null) ? unescape(value[1]) : null;
}


$(document).ready(function(){

    $("#seasonSubmitButton").click(function(){
        var season = $("input[name=seasonListItem]:checked","#seasonRadioList").val();
        $("#seasonQuestionsTitle").text("Season specific data for \'" + 
        season + "\'.");

        $("#elementsTableTitle").text("Scoring table for season \'" + season + "\'");
        
        $("input[name=seasonListItem]:checked","#seasonRadioList").setCurrCheckedSeason();
        
        $("#scoringTable").setTable();
    });


    $.fn.setTable = function(){
        var cookieList = document.cookie.split(";");
        for (var i = 0; i < cookieList.length; i++)
        {
            cookieList[i] = cookieList[i].trim();
            if (cookieList[i].startsWith("element"))
            {
                var cookieSeason = cookieList[i].substring(cookieList[i].indexOf(":")+1,cookieList[i].indexOf("="));
                console.log(cookieSeason);
                var season = getCookie("currCheckedSeason");
                $(this).val(" ");
                if (cookieSeason == season)
                {
                    var elementName = cookieList[i].split("=")[1].split(",")[0].trim();
                    var elementPoints = cookieList[i].split("=")[1].split(",")[1].trim();

                    var newTRHtml = "<tr><td>" + elementName + 
                    "</td><td>" + elementPoints + "</td></tr>";

                    if ($(this).html().indexOf(newTRHtml) < 0)
                    {
                        $(this).append(newTRHtml);
                    }
                } else
                {
                    $(this).val(" ");
                }
            }
        }
    }

    $.fn.setCurrCheckedSeason = function(){
        var currCheckedSeason = this.val();
        if (typeof(currCheckedSeason) !== "undefined")
        {
            document.cookie = "currCheckedSeason="+currCheckedSeason+
            "; expires=Wed, 1 Jan 2038 12:00:00 UTC; path=/";
        }
    };
    /*
    function setCurrCheckedSeason(){
        var currCheckedSeason = $("input[name=seasonListItem]:checked","#seasonRadioList").val();
        if (typeof(currCheckedSeason) !== "undefined")
        {
            document.cookie = "currCheckedSeason="+currCheckedSeason+
            "; expires=Wed, 1 Jan 2038 12:00:00 UTC; path=/";
        }
    };*/

    function getCurrCheckedSeason($param) {
        var currCheckedSeason = $param.val();
        if (typeof(currCheckedSeason) !== "undefined")
        {
            return currCheckedSeason;
        }
    }


    $("#scoringSaveButton").click(function(){
        var newElementName = $("#seasonElement").val().split(',')[0].trim().toString();
        var newElementPoints = $("#seasonElement").val().split(',')[1].trim();
        
        var season = $("input[name=seasonListItem]:checked","#seasonRadioList").val();
        if (typeof(season) !== "undefined")
        {
            var cookieName = "element " + newElementName + ":" +season;
            var cookieValue = newElementName+","+newElementPoints;
            
            var cookieList = document.cookie.split(";");
            var elementAlreadyStored = false;
            for (var i = 0; i < cookieList.length; i++)
            {
                if (cookieList[i].trim().startsWith("element"))
                {
                    var checkerCName = cookieList[i].split("=")[1].trim().split(",")[0].toString();
                    if (checkerCName == newElementName)
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
                //doc.cookie --> element:deep space= ball,6; element:deep space = hatch,2;...;

                var newTRHtml = "<tr><td>" + newElementName + 
                "</td><td>" + newElementPoints + "</td></tr>";
                
                $("#scoringTable").append(newTRHtml);
            } else
            {
                $("#elementConfirmationBox").text("Please enter an element not already in the table.");
            }
        } else
        {
            $("#elementConfirmationBox").text("Please check a season.");
        }      
    });
});