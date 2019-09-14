//credit to w3schools for js tutorials

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
    var newSeason = document.getElementsByName("newSeasonInputBox")[0].value.toString();

    var cookieList = document.cookie.split(";");
    var isAlreadyStored = false;
    if (document.cookie.length > 0)
    {
        for (var i=0;i<cookieList.length;i++)
        {
            var val = cookieList[i].split("=")[1];
            if (newSeason==val.toString())
            {
                isAlreadyStored = true;
                break;
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
        formSpace.innerHTML += "<input type=\"radio\" name=\"seasonListItem\"> " //add to radiolist
        + newSeason + "<br>";

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
            var cookieVal = cookieList[i].split("=")[1];
            formSpace.innerHTML += "<input type=\"radio\" name=\"seasonListItem\"> "
            + cookieVal + "<br>";
        }
    }
}

//clears all seasons from formspace
function clearSeasons()
{
    console.log("doc.cookie: " + document.cookie);
    //var divSpace = document.getElementById("seasonRadioList");
    //divSpace.innerHTML = " ";

    //clearing all cookies
    var cookies = document.cookie.split(";");
    var x = document.cookie.toString();
    console.log(x);
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