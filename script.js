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
            var cookieVal = cookieList[i].split("=")[1];
            //formSpace.innerHTML += "<input type=\"radio\" name=\"seasonListItem\"> " + cookieVal + "<br>";
            formSpace.insertAdjacentHTML("afterbegin","<input type=\"radio\" name=\"seasonListItem\" value=\"" +cookieVal + "\">"+cookieVal+ "<br>");
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

function currentCheckedSeason()
{

}

$(document).ready(function()
{
    $("#seasonSubmitButton").click(function(){
        var season = $("input[name=seasonListItem]:checked","#seasonRadioList").val();
        $("#seasonQuestionsTitle").text("Season specific data for \'" + 
        season + "\'.");        
    })

    $("#newTR").click(function(){
        var newRowHtml = "<tr> <th><input type=\"text\" name=\"seasonElement\"></th> <th><input type=\"number\" name=\"seasonPoints\"></th> </tr>";
        $("#scoringTable").append(newRowHtml);
    })

    /*
    $("#scoringSaveButton").click(function(){
        var $inputs = $("#seasonSubmitForm :input");
        var values = {};
        $inputs.each(function(){
            values[this.name] = $(this).val();
            console.log($(this).val);
        });*/

    $("#seasonSubmitForm").submit(function(){
        //var $inputs = $("#seasonSubmitForm :input");
        var allInputs = $(":input");
        console.log(allInputs.val());
    })

})