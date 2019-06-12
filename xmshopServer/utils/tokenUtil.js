'use strict';
const crypto = require('crypto');

// 生成MD5值
function creatMd5Str(str) {
    const hash = crypto.createHash('md5');
    hash.update(str);
    return hash.digest("hex");
}

// 生成盐值的MD5
function getRandSlat() {
    let randNum = Math.random().toString().slice(2);
    return creatMd5Str(randNum);
}


// 生成加密密码
let fn_creatPasswordWithSalt = function(oripwd, saltCrypto) {
    let savePwd = creatMd5Str(oripwd) + ":" + saltCrypto;
    return creatMd5Str(savePwd);
}

// 生成加密密码和随机盐值
let fn_creatPasswordAndSalt = function(oripwd) {
    let saltCrypto = getRandSlat();
    let savePwd = creatMd5Str(oripwd) + ":" + saltCrypto;
    let savePwdCry = creatMd5Str(savePwd);
    return {
        password: savePwdCry,
        salt: saltCrypto
    }

}


// 生成token('账号' + '密码' + '方法' + '日期') 
let fn_creatAccessToken = function(name, password, methodName) {
    let str = name + password + methodName + Date.now() + getRandSlat();
    console.log("生成accesstoken请求:" + str);
    const hash = crypto.createHash('md5');
    hash.update(str);
    return hash.digest("hex");
}

module.exports = {
    creatAccessToken: fn_creatAccessToken,
    creatPasswordWithSalt: fn_creatPasswordWithSalt,
    creatPasswordAndSalt: fn_creatPasswordAndSalt,
}