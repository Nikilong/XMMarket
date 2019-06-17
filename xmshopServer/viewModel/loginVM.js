'use strict';


const db = require('../utils/xmonshopSql'); // 引入数据库
const tokenUtil = require('../utils/tokenUtil'); // token工具

let fn_loginServer = async function(method, data) {
    let resData = {};
    try {
        if (typeof(eval(method)) === "function") {
            return await eval(`${method}(${JSON.stringify(data)})`);
        }
    } catch (e) {
        // console.warn(e)
        resData.error = {};
        resData.error.name = e.name;
        resData.error.message = e.message;

        return await resData;
    }
}

// 验证accesstoken是否有效
let validToken = function(data) {
    let params = data.PARAMS;
    let sqlStr = `select * from Users where id=${params.userId} and accesstoken='${params.accesstoken}'`;

    return new Promise((resolve, reject) => {
        // 查询实例
        db.query(sqlStr, [], function(result, fields) {
            console.log('查询结果：');
            console.log(result);
            let resData = {};
            if (result.length > 0) {
                if (Date.now() > result[0].expire_time) {
                    resData.msg = 'token已失效';
                    resData.status = 'falied';
                } else {
                    resData.msg = 'token验证有效';
                    resData.status = 'success';
                    resData.editRight = result[0].permission;
                }
            } else {
                resData.msg = '错误的id或者token';
                resData.status = 'failed';
            }
            resolve(resData);
        });

    }).catch(e => {
        console.log(e)
        let resData = {}
        resData.status = "failed"
        resData.msg = e.message
        return resData
    })
}

// 检查用户是否存在
let checkAccount = function(data) {
    let params = data.PARAMS;
    let sqlStr = `select * from Users where account='${params.account}'`;

    return new Promise((resolve, reject) => {
        // 查询实例
        db.query(sqlStr, [], function(result, fields) {
            console.log('查询结果：');
            console.log(result);
            let resData = {};
            if (result.length > 0) {
                resData.msg = '账号已存在';
                resData.status = 'falied';
            } else {
                resData.msg = '该账号尚未注册';
                resData.status = 'success';
            }
            resolve(resData);
        });

    }).catch(e => {
        console.log(e)
        let resData = {}
        resData.status = "failed"
        resData.msg = e.message
        return resData
    })
}

// 登录验证
let login = function(data) {
    let params = data.PARAMS;
    let sqlStr = `select * from Users where account='${params.account}'`;

    return new Promise((resolve, reject) => {
        // 查询实例
        db.query(sqlStr, [], function(result, fields) {
            console.log('查询结果：');
            console.log(result);
            let resData = {
                status: 'failed',
                msg: ''
            };
            // update user set user_name="jack" where id=3;
            if (result.length > 0) {
                let crypwd = tokenUtil.creatPasswordWithSalt(params.password, result[0].lucky_num);
                if (crypwd === result[0].password) {
                    // 复制结果
                    let resultCopy = JSON.parse(JSON.stringify(result[0]));
                    delete resultCopy.password; // 删除密码
                    delete resultCopy.lucky_num; // 删除盐值

                    let accesstoken = tokenUtil.creatAccessToken(params.account, params.password, login.name);
                    resultCopy.accesstoken = accesstoken;

                    let expire_time = Date.now() + 1 * 3600 * 1000; // 设置token的过期时间2h,Date.now()返回1970-1-1至今的毫秒数
                    resultCopy.expire_time = expire_time;

                    resData.userMsg = resultCopy;
                    resData.status = 'success';
                    resData.msg = '登陆成功';
                    db.query(`UPDATE Users SET accesstoken="${accesstoken}",expire_time=${expire_time} where account="${params.account}"`, [], function(result, fields) {
                        console.log('更新accesstoken结果：');
                        console.log(result);
                    });
                } else {
                    resData.msg = '密码错误';
                }
            } else {
                resData.msg = '账号不存在';
            }
            // console.log(resData)
            resolve(resData);
        });

    }).catch(e => {
        console.log(e)
        let resData = {}
        resData.status = "failed"
        resData.msg = e.message
        return resData
    })
}

// 修改密码
// let changePassword = function(account, oldOriPwd, newOriPwd) {
let changePassword = function(data) {
    let params = data.PARAMS;
    let sqlStr = `select * from Users where account='${params.account}'`;

    return new Promise((resolve, reject) => {
        // 查询实例
        db.query(sqlStr, [], function(result, fields) {
            console.log('查询结果：');
            console.log(result);
            let resData = {
                status: 'failed',
                msg: ''
            };
            // update user set user_name="jack" where id=3;
            if (result.length > 0) {
                let crypwd = tokenUtil.creatPasswordWithSalt(params.oldOriPwd, result[0].lucky_num);
                if (crypwd === result[0].password) {

                    let pwdAndSaltJson = tokenUtil.creatPasswordAndSalt(params.newOriPwd);
                    let accesstoken = tokenUtil.creatAccessToken(params.account, params.newOriPwd, changePassword.name);

                    // 复制结果
                    let resultCopy = JSON.parse(JSON.stringify(result[0]));
                    resultCopy.accesstoken = accesstoken;
                    delete resultCopy.password; // 删除密码
                    delete resultCopy.lucky_num; // 删除盐值


                    let createSql = `UPDATE Users SET accesstoken=?,password=?,lucky_num=?  where account="${params.account}"`;
                    let sqlValues = [accesstoken, pwdAndSaltJson.password, pwdAndSaltJson.salt];

                    resData.userMsg = resultCopy;
                    resData.status = 'success';
                    resData.msg = '修改密码成功';
                    db.query(createSql, sqlValues, function(result, fields) {
                        console.log('修改密码结果：');
                        console.log(result);
                    });
                } else {
                    resData.msg = '原密码错误';
                }
            } else {
                resData.msg = '账号不存在';
            }
            console.log(resData)
            resolve(resData);
        });

    }).catch(e => {
        console.log(e)
        let resData = {}
        resData.status = "failed"
        resData.msg = e.message
        return resData
    })
}

// 注册新账号
let creatAccount = function(data) {
    let params = data.PARAMS;
    let sqlStr = `select * from Users where account='${params.account}'`;
    return new Promise((resolve, reject) => {
        // 查询实例
        db.query(sqlStr, [], function(result, fields) {
            console.log('查询结果：');
            console.log(result);
            let resData = {
                status: 'failed',
                msg: ''
            };
            if (result.length > 0) {
                resData.msg = '账号已存在';
                resolve(resData)
            } else {
                let accesstoken = tokenUtil.creatAccessToken(params.account, params.password, creatAccount.name);
                let pwdAndSaltJson = tokenUtil.creatPasswordAndSalt(params.password);
                let createSql = `insert into Users(account,password,name,accesstoken,phone,email,lucky_num) values(?,?,?,?,?,?,?);`;
                let sqlValues = [params.account, pwdAndSaltJson.password, params.name, accesstoken, params.phone, params.email, pwdAndSaltJson.salt];

                // 复制结果
                let resultCopy = JSON.parse(JSON.stringify(params));
                delete resultCopy.password; // 删除密码
                delete resultCopy.passwordConfirm; // 删除密码
                resultCopy.accesstoken = accesstoken;

                db.query(createSql, sqlValues, function(result, fields) {
                    console.log('创建结果：');
                    console.log(result);
                    resData.status = 'success';
                    resData.msg = '创建成功';
                    resData.userMsg = resultCopy;
                    resolve(resData)
                });

            }
        });

    }).catch(e => {
        console.log(e)
        let resData = {}
        resData.status = "failed"
        resData.msg = e.message
        return resData
    })
}

module.exports = {
    loginServer: fn_loginServer,
}

// console.log(Date.now() + 24 * 3600 * 1000)
// console.log(typeof(Date.now()))


// 测试数据

// validToken({ "PARAMS": { userId: "1", accesstoken: "513d03fe0cf2512f1240610bd267c833" } })

// login({ "PARAMS": { 'account': "nilo", 'password': "1" } })
// var aaa = {
//     account: "nilo",
//     email: "2341@163.com",
//     name: "你空",
//     password: "1",
//     passwordConfirm: "1",
//     phone: "213124"
// };
// // fn_creatAccount(aaa)

// 修改密码
// fn_changePassword("zhangs", "11", "1");

// 
// function aaaa(str, params) {
//     console.log("---------")
//     console.log(str)
//     console.log(params)
//     console.log(typeof(params))
//     console.log(params.ccc.aaa1)
// }

// var func_Name = "aaaab";

// function aa() {
//     try {
//         if (typeof(eval(func_Name)) === "function") {
//             let str = "helo";
//             let par = { "aaa": "111", "bbb": "2222", "ccc": { "aaa1": "11111", "bbb1": "222222" } };
//             eval(`${func_Name}("${str}",${JSON.stringify(par)})`);
//         }
//     } catch (e) {
//         console.warn(e)
//         console.log("hjsubucyzd")
//         return e;
//     }

// }
// console.log(aa())