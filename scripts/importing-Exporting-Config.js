function loadSeasonRadioList() //basically a copy paste of loadSeasons(), but didn't want to mess with season config stuff
{
    if (document.cookie.length == 0)
    {
        return;
    } else if (getCookie('seasonList').trim().length == 0)
    {
        return;
    }

    $('#seasonRadioList-imp-exp-data').html(''); //default the radio list
    var seasonList = getCookie('seasonList').split(SEASON_LIST_SEPARATOR).slice(0,-1); //slice removes last ''
    for (var i=0;i<seasonList.length;i++)
    {
        var cookieVal = seasonList[i];
        var newInputHTML = `<label><input type='checkbox' name='seasonListItem-imp-exp-data' value='${cookieVal}'>${cookieVal}</label><br>`
        
        $("#seasonRadioList-imp-exp-data").append(newInputHTML); //season names guaranteed to be unique, don't need to check for duplicates
    }

    $('.js_clear_on_load').val("").html("");
    var cname = checked_seasons_name(); 
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

    var cname = checked_seasons_name();
    var cvalue = arr.toString(); //arr gets split up into a csv string
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
    var checkedSeasonList = getCurrCheckedSeasons().split(','); // csv string --> array

    var output = {};
    for (var i = 0; i < checkedSeasonList.length; i++) //loop through each checked season
    {
        var season = checkedSeasonList[i];
        var elementStart = `/season_config/${season}/`;
        var pitStart = `${season} pitQuestions`

        var cookieList = document.cookie.split(';');

        var elementsArr = [];
        var questionsArr = [];
        for (var j = 0; j < cookieList.length; j++)
        {
            var cookie = cookieList[j].trim();
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
                var questionList = cvalue.split(COOKIE_QUESTION_SEPARATOR).slice(0,-1); //slice to take off the last '' in arr
                for (var k = 0; k < questionList.length; k++)
                {
                    questionsArr.push(questionList[k]);
                }
            }
        }

        var elementsObjName = season + ' elements';
        var pitQuestionsObjName = season + ' pitQuestions';
        output[elementsObjName] = elementsArr;
        output[pitQuestionsObjName] = questionsArr;
    }
 
    /*
        (output, with more nested tabs and formatting)
        {
            '{season} elements' : [{element1:value1},{element2:value2},...],
            '{season} elements' : [question1,question2,question3,...]
        }
    */
    
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

        if (file.name.endsWith('.rcubedscoutconfig'))
        {
            parseFile(obj);
        } else
        {
            $('#importConfirmation').text('No ".rcubedscoutconfig" file selected.');
        }
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
        var seasons = getCurrCheckedSeasons();
        console.log(seasons);
        if (seasons.trim().length == 0)
        {
            $('#exportConfirmation').text('No season(s) selected.');
            return false;
        }

        exportData();
        $('#exportConfirmation').text('Data exported.');        
    });

    $('#importButton').click(function()
    {
        var season = getCurrCheckedSeasons();
        if (season.trim().length == 0)
        {
            $('#importConfirmation').text('No season(s) selected');
            return;
        }

        readImportFile();
        $('#importConfirmation').text('Data imported.');
    });
});

function checked_seasons_name()
{
    return '/imp-exp-data/checkedSeasons';
}

function getCurrCheckedSeasons() //returns string of checked seasons
{
    var cname = checked_seasons_name();
    var seasonStr = getCookie(cname);

    return (seasonStr.trim().length == 0 ? '' : seasonStr); 
}