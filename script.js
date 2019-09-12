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
    if (seasonList.includes(newSeason))
    {
        document.getElementById("newSeasonConfirmation").innerHTML=
    "<i>Season \'" + newSeason +"\' already exists.</i>";    
    } else
    {
        seasonList.push(newSeason);
        document.getElementById("newSeasonConfirmation").innerHTML=
        "<i>Season " + "\'"+ newSeason +"\'"+" has been added.</i>";
        displaySeasons(newSeason);
    }
}

//displays seasons in a radio list
function displaySeasons(newSeason)
{
    var divSpace = document.getElementById("seasonRadioList");
    divSpace.innerHTML += "<input type=\"radio\" class=\"seasonList\"> "
    + newSeason + "<br>";
}

function clearSeasons()
{
    var divSpace = document.getElementById("seasonRadioList");
    seasonList = [];
    divSpace.innerHTML = " ";
}