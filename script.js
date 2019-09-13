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
    document.cookie = name + "=" + value + ";";
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
    var cookies = decodeURIComponent(document.cookie);
    var formSpace = document.getElementById("seasonRadioList");
    var cookieList = cookies.split(';');
    for (var i = 0; i < cookieList.length; i++)
    {
        var season = cookieList[i].split('=')[1];
        formSpace.innerHTML = "<input type=\"radio\" name=\"seasonListItem\"> "
        + season + "<br>";
    }
    /*for (var i = 0; i < seasonList.length; i++)
    {
        formSpace.innerHTML += "<input type=\"radio\" name=\"seasonListItem\"> "
        + seasonList[i] + "<br>";
        console.log(seasonList[i]);
    }*/
}

//clears all seasons from formspace
function clearSeasons()
{
    var divSpace = document.getElementById("seasonRadioList");
    seasonList = [];
    divSpace.innerHTML = " ";
}