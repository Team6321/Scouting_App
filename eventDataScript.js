//credit to w3schools for js tutorials, stackoverflow

function loadPage()
{
    showTopText();
}

function isSeasonSaved()
{
    var currSeason = getCookie('currCheckedSeason');
    if (currSeason !== " ")
        return true;
    else
        return false;
}

//shows intro text for page
function showTopText()
{
    var finalText;
    if (isSeasonSaved())
    {
        var currSeason = getCookie('currCheckedSeason');
        finalText = 'Here, enter all the events that the team will attend for season "' + currSeason + '".';
    } else
    {
        finalText = 'No season is currently saved. Go back to the Season Configuration page ' + 
        'to enter new seasons and season-specific elements/pit scouting questions. Make sure you check the new season you enter.'
    }
    $("#eventDataIntroText").text(finalText);
}