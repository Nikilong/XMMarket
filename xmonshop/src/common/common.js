import Vue from 'vue'
import App from '../App'
import axios from 'axios'
import { Loading, Toast, Confirm, Icon } from 'vux'

import store from '../store'


let serverUri = function() {
    return "http://localhost:4001/servers?m" + Math.random();
    // return "http://120.78.165.47:4001/servers?m" + Math.random();
    // return "http://172.20.105.87:4001/servers?m" + Math.random();
    // return "http://192.168.1.102:4001/servers?m" + Math.random();
    // return "http://192.168.1.106:4001/servers?m" + Math.random();
}

/*cookie编辑函数*/
// [Cookie] Clears a cookie 
let clearCookie = function(cookieName) {
        var now = new Date(),
            yesterday = new Date(now.getTime() - 1000 * 60 * 60 * 24);
        setCookie(cookieName, 'cookieValue', yesterday);
    }
    // [Cookie] Sets value in a cookie
let setCookie = function(cookieName, cookieValue, expires, path, domain, secure) {
        var cookie = escape(cookieName) + '=' + escape(cookieValue);
        if (expires) cookie += ';expires=' + expires.toGMTString();
        if (path) cookie += ';path=' + path;
        if (domain) cookie += ';domain=' + domain;
        if (secure) cookie += ';secure=' + secure;
        document.cookie = cookie;
    }
    // [Cookie] Gets a value from a cookie
let getCookie = function(cookieName) {
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

let getQueryString = function(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

let scrollAnimation = function(currentY, targetY) {
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
let pushHistory = function() {
    let state = { title: "_pushHistoryTitle", url: "" }
    window.history.pushState(state, state.title, state.url)
}

let isPushHistory = function() {
    return window.history.state.title === "_pushHistoryTitle"
}

let ask = function() {
    console.log("ask=======")
        // 获取商品清单
    let data = {
        HEADER: {},
        PARAMS: { num: 10, pageNum: 0 },
        SERVICE: "ShopService.queryProductions"
    };
    axios({
        url: "http://localhost:4001/servers?m0.7778315282227477",
        method: "post",
        data: data
    }).then(function(response) {
        console.log(response)
    });
}

//检查token是否有效
let avalidToken = function(callback, failedCallback) {
    let userId = getCookie("_userId")
    let token = getCookie("_accesstoken")

    let result = {}
    if (userId.trim().length > 0 && token.trim().length > 0) {
        let data = {
            HEADER: {},
            PARAMS: { userId: userId, accesstoken: token },
            SERVICE: "LoginService.validToken"
        }
        axios({
                url: serverUri(),
                method: "post",
                data: data
            })
            .then(function(response) {
                console.log(response.data)
                if (response.data.status === "success") {
                    callback && callback(response.data)
                } else {
                    failedCallback && failedCallback(response.data)
                }
            })
    } else {
        result.status = "failed"
        result.msg = "userId或者acctoken不存在"
        failedCallback && failedCallback(result)
    }
}


/// 公用弹框
let toast = function(type, text) {
    store.dispatch('toastCenter/showToast', { text: text, type: type })
}

export default {
    serverUri,
    clearCookie,
    setCookie,
    getCookie,
    getQueryString,
    scrollAnimation,
    pushHistory,
    isPushHistory,
    ask,
    avalidToken,
    toast
}