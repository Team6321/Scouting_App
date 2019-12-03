function setUpDownloadLink()
{
    $('#configExportLink').attr('href', 'data:text/plain;charset=utf-8,');
}

function download() //onclick for button
{
    var season = getCurrSeason();
    if (season.trim().length == 0)
    {
        $('#exportConfirmation').text('No season selected.');
        return;
    }

    var config_json = getData();
    $('#configExportLink').attr().append(encodeURIComponent(config_json));
}

function getData()
{
    var output = {};
    //All elements/questions are stored in cookies, will need to go through cookies
    var season = getCurrSeason();


    //Output object will be an object of smaller objects, with the cookie name as the obj key and cookie value as the  objvalue
}

$(document).ready(function()
{
    setUpDownloadLink(); //initializes href etc

    $('#exportConfirmation').click(download);
});