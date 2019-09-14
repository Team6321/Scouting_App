//credit to w3schools for js tutorials

//navbar on all pages//
//open navbar
function openNav(){
    document.getElementById("mySidenav").style.width= "250px";
}

//closing navbar
function closeNav(){
document.getElementById("mySidenav").style.width="0";
}

//season config js//
//adds new season from input box
var seasonList = [];
function addNewSeason()
{
    var newSeason = document.getElementsByName("newSeasonInputBox")[0].value;
    if (seasonList.includes(newSeason)) //if season is already stored
    {
        document.getElementById("newSeasonConfirmation").innerHTML=
    "<i>Season \'" + newSeason +"\' already exists.</i>";    
    } else
    {
        //add to radioList
        seasonList.push(newSeason);
        document.getElementById("newSeasonConfirmation").innerHTML=
        "<i>Season " + "\'"+ newSeason +"\'"+" has been added.</i>";
        var formSpace = document.getElementById("seasonRadioList");
        formSpace.innerHTML += "<input type=\"radio\" name=\"seasonListItem\"> "
        + newSeason + "<br>";

        //save newSeason in cookie
        setCookie("seasonName",newSeason);
    }
}

function setCookie(name, value)
{
    document.cookie += name + "=" + value + ";";
}

function getCookie(cname)
{
    var name = cname +"=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i=0; i<ca.length;i++)
    {
        var c=ca[i];
        while (c.charAt(0) == ' ')
        {
            c = c.substring(1);
        }
        if (c.indexOf(name)==0)
        {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
/*
function getCookie(name)
{
    var re = new RegExp(name + "=([^;]+)");
    var value = re.exec(document.cookie);
    return (value != null) ? unescape(value[1]) : null;
}*/

//meant for only the startup of the page
function loadSeasons()
{
    var formSpace = document.getElementById("seasonRadioList");
    var cookieList = document.cookie.split("seasonName=");
    for (var i=1;i<cookieList.length;i++)
    {
        formSpace.innerHTML += "<input type=\"radio\" name=\"seasonListItem\"> "
        + cookieList[i] + "<br>";
    }
}

//clears all seasons from formspace
function clearSeasons()
{
    var divSpace = document.getElementById("seasonRadioList");
    seasonList = [];
    divSpace.innerHTML = " ";
}