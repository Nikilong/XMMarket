function serverUri() {
    return "http://localhost:4001/servers?m" + Math.random();
    // return "http://172.20.105.87:4001/servers?m" + Math.random();
    // return "http://192.168.1.102:4001/servers?m" + Math.random();
    // return "http://192.168.1.106:4001/servers?m" + Math.random();
}

/*cookie编辑函数*/
// [Cookie] Clears a cookie 
function clearCookie(cookieName) {
    var now = new Date(),
        yesterday = new Date(now.getTime() - 1000 * 60 * 60 * 24);
    setCookie(cookieName, 'cookieValue', yesterday);
}
// [Cookie] Sets value in a cookie
function setCookie(cookieName, cookieValue, expires, path, domain, secure) {
    var cookie = escape(cookieName) + '=' + escape(cookieValue);
    if (expires) cookie += ';expires=' + expires.toGMTString();
    if (path) cookie += ';path=' + path;
    if (domain) cookie += ';domain=' + domain;
    if (secure) cookie += ';secure=' + secure;
    document.cookie = cookie;
}
// [Cookie] Gets a value from a cookie
function getCookie(cookieName) {
    var cookieValue = '',
        cookie = document.cookie,
        posName = cookie.indexOf(escape(cookieName) + '=');
    if (posName != -1) {
        var posValue = posName + (escape(cookieName) + '=').length,
            endPos = cookie.indexOf(';', posValue);
        if (endPos != -1) {
            cookieValue = unescape(cookie.substring(posValue, endPos))
        } else {
            cookieValue = unescape(cookie.substring(posValue))
        }
    }
    return (cookieValue)
};

function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

function scrollAnimation(currentY, targetY) {
    // 计算需要移动的距离
    let needScrollTop = targetY - currentY
    let _currentY = currentY
    setTimeout(() => {
        // 一次调用滑动帧数，每次调用会不一样
        const dist = Math.ceil(needScrollTop / 10)
        _currentY += dist
        window.scrollTo(_currentY, currentY)
            // 如果移动幅度小于十个像素，直接移动，否则递归调用，实现动画效果
        if (needScrollTop > 10 || needScrollTop < -10) {
            scrollAnimation(_currentY, targetY)
        } else {
            window.scrollTo(_currentY, targetY)
        }
    }, 1)
}

// push一个空白url
function pushHistory() {
    let state = { title: "_pushHistoryTitle", url: "" }
    window.history.pushState(state, state.title, state.url)
}

function isPushHistory() {
    return window.history.state.title === "_pushHistoryTitle"
}

module.exports = {
    serverUri: serverUri,
    setCookie: setCookie,
    getCookie: getCookie,
    clearCookie: clearCookie,
    scrollAnimation: scrollAnimation,
    getQueryString: GetQueryString,
    pushHistory: pushHistory,
    isPushHistory: isPushHistory,
}