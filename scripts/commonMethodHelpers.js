function deleteCookie(name)
{
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';   
}

function setCookie(cname, cvalue, exdays=750) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(name)
{
    var re = new RegExp(name + "=([^;]+)");
    var value = re.exec(document.cookie);
    return (value != null) ? unescape(value[1]) : " ";
}

function event_data_cookie_name(season,event)
{
    return `/event_data teams/${ season }/${ event }`;
}

function getCurrEvent()
{
    var cookieEv = getCookie('currCheckedEvent');
    return cookieEv.substring(cookieEv.lastIndexOf('/')+1);
}

function getTeams(season, currEvent)
{
    var cname = event_data_cookie_name(season,currEvent);
    var result = JSON.parse(getCookie(cname));
    return result;
}