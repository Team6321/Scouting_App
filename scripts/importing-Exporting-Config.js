function setExportLink(addend)
{
    $('#configExportLink').attr('href', 'data:text/plain;charset=utf-8,' + addend);
}

function download()
{
    setExportLink(''); //default the link
    var config_json = encodeURIComponent(getExportData());
    setExportLink(config_json);
}

function getExportData() //returns prettified (tabbed) json.stringify version of config object
{
    var season = getCurrSeason();
    var elementStart = `/season_config/${season}/`;
    var pitStart = `${season} pitQuestions`

    var cookieList = document.cookie.split(';');

   var elementsArr = [];
   var questionsArr = [];
    for (var i = 0; i < cookieList.length; i++)
    {
        var cookie = cookieList[i].trim();
        var cvalue = cookie.substring(cookie.indexOf('=')+1);
        
        if (cookie.startsWith(elementStart)) //if cookie contains an element
        {
            var objName = getElementName(cookie);
            var objValue = getElementValue(cookie);
            var pair = {};
            pair[objName] = objValue;
            elementsArr.push(pair);
        }

        if (cookie.startsWith(pitStart)) //if cookie contains the pit question list
        {
            //loop through each question in cookie and add that to questionsArr
            var questionList = cvalue.split(COOKIE_QUESTION_SEPARATOR).slice(0,-1); //slice to take off the last separator
            for (var j = 0; j < questionList.length; j++)
            {
                questionsArr.push(questionList[j]);
            }
        }
    }
 
    /*
        (output, with more nested tabs and formatting)
        {
            '{season} elements' : [{element1:value1},{element2:value2},...],
            '{season} elements' : [question1,question2,question3,...]
        }
    */
    var output = {};
    var elementsObjName = season + ' elements';
    var pitQuestionsObjName = season + ' pitQuestions';
    output[elementsObjName] = elementsArr;
    output[pitQuestionsObjName] = questionsArr;
    
    return JSON.stringify(output,null,'\t');
}

$(document).ready(function()
{
    setExportLink('');

    $('#configExportLink').click(function()
    {
        var season = getCurrSeason();
        if (season.trim().length == 0)
        {
            $('#exportConfirmation').text('No season selected.');
            return false;
        }

        download();
        $('.js_clear_on_load').val('').html('');        
    });
});