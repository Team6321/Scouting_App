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
function addNewSeason()
{
    var newSeason = document.getElementsByName("newSeasonInputBox")[0].value;
    console.log("newSeason: ",newSeason);
    document.getElementById("newSeasonConfirmation").innerHTML=
    "Season " + "\'"+ newSeason +"\'"+" has been added.";
}