function loadSeasonRadioList() //basically a copy paste of loadSeasons(), but didn't want to mess with season config stuff
{
    if (document.cookie.length == 0)
    {
        return;
    } else if (getCookie('seasonList').trim().length == 0)
    {
        return;
    }

    var seasonList = getCookie('seasonList').split(SEASON_LIST_SEPARATOR).slice(0,-1); //slice removes last ''
    for (var i=0;i<seasonList.length;i++)
    {
        var cookieVal = seasonList[i];
        var newInputHTML = `<label><input type='checkbox' name='seasonListItem-imp-exp-data' value='${cookieVal}'>${cookieVal}</label><br>`
        
        if ($('#seasonRadioList-imp-exp-data').html().indexOf(newInputHTML) < 0) //if not included yet
        {
            $("#seasonRadioList-imp-exp-data").append(newInputHTML);
        }
    }

    $('.js_clear_on_load').val("").html("");
    var cname ='checkedSeasons imp-exp-data'; 
    setCookie(cname,'',750);
}

function setCheckedSeasons() //onchange for checked seasons checkboxes
{
    //set a cookie for checkedSeasons
    var arr = [];
    $('input[type=checkbox]').each(function () 
    {
        if (this.checked)
        {
            arr.push($(this).val());
        }
    });

    var cname = 'checkedSeasons imp-exp-data';
    var cvalue = arr.toString();
    console.log(cvalue);
    setCookie(cname,cvalue,750);
}

//Exporting season config \/\/\/
function setExportLink(addend)
{
    $('#configExportLink').attr('href', 'data:text/plain;charset=utf-8,' + addend);
}

function exportData()
{
    setExportLink(''); //default the link
    var config_json = encodeURIComponent(getExportData());
    setExportLink(config_json);
}

function getExportData() //returns prettified (tabbed) json.stringify version of current config
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





// Importing Season config \/\/\/
function readImportFile()
{
    var file = $('#importFile').prop('files')[0];

    var fr = new FileReader();
    fr.onload = function(e) {
        var content = e.target.result;
        var obj = JSON.parse(content);

        parseFile(obj);
    }
    fr.readAsText(file);
}

function parseFile(obj) //goes through inner objects and assigns values to cookies
{
    var season = getCurrSeason();

    var elementObjName = `${season} elements`;
    var pitObjName = `${season} pitQuestions`;
    console.log(elementObjName);

    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++)
    {
        currObj = keys[i];
        if (currObj.localeCompare(elementObjName) == 0)
        {
            //set element value pairs
            var innerArr = obj[currObj];
            for (var j = 0; j < innerArr.length; j++)
            {
                var pair = innerArr[j];
                var elementName = Object.keys(pair)[0]; //only has one kv pair
                var elementValue = pair[elementName];

                var cookieName = season_config_cookie_name(season,elementName);
                setCookie(cookieName,elementValue,750);
            }
            setTable(season); //shows element table for curr season
        }

        if (currObj.localeCompare(pitObjName) == 0)
        {
            //set pitQuestions cookie
            var cookieName = `${season} pitQuestions`
            var cookieValString = '';

            var innerArr = obj[currObj];
            for (var j = 0; j < innerArr.length; j++)
            {
                cookieValString += innerArr[j] + COOKIE_QUESTION_SEPARATOR;
            }
            setCookie(cookieName,cookieValString,750);
            setPitQuestionTextBox(season);
        }
    }
}

$(document).ready(function()
{
    setExportLink(''); //default export link
    $('#importFile').val(null); //default import link
    loadSeasonRadioList(); //set up radio list

    $('#configExportLink').click(function()
    {
        var season = getCurrSeason();
        if (season.trim().length == 0)
        {
            $('#exportConfirmation').text('No season selected.');
            return false;
        }

        exportData();
        $('#exportConfirmation').text('Season configuration exported.');        
    });

    $('#importButton').click(function()
    {
        var season = getCurrSeason();
        if (season.trim().length == 0)
        {
            $('#importConfirmation').text('No season selected');
            return;
        }

        readImportFile();
        $('#importConfirmation').text('Season configuration imported.');
    });
});

function getCurrCheckedSeasons() //returns string of checked seasons
{
    var seasonStr = getCookie('checkedSeasons imp-exp-data');
    if (seasonStr.trim().length == 0) return '';

    return seasonStr;
}