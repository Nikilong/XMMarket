'use strict';


const db = require('../utils/xmonshopSql'); // 引入数据库
const tokenUtil = require('../utils/tokenUtil'); // token工具
const moment = require('moment')

let fn_orderServer = async function(method, data) {
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

// 查询订单信息
let queryOrder = function(data) {
    let params = data.PARAMS;
    let sqlStr = `SELECT price,num FROM orders WHERE serials="${params.serials}"`
    console.log(sqlStr)
    let sqlData = []

    return new Promise((resolve, reject) => {
        // 查询实例
        db.query(sqlStr, sqlData, function(result, fields) {
            console.log('查询结果:%s', result.length);
            let resData = {};
            resData.status = 'success';
            resData.RESULT = result;
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

// 生成订单
let creatOrder = function(data) {
    let params = data.PARAMS;


    let list = params.list
    let sqlStr = ""
    let sqlData = []

    let serials = "XM" + moment().format("YYMMDDHHmmss") + list[0].userId + Math.random().toString().slice(15); // 流水号:时间+用户id+4位随机数
    let create_time = moment().format("YYYY-MM-DD HH:mm:ss")

    if (list.length == 1) {
        let item = list[0]
        sqlStr = `INSERT INTO orders(buyer_id,production_id,production_type,price,num,serials,create_time) VALUE(?,?,?,?,?,?,?)`;
        sqlData = [item.userId, item.itemId, item.type, item.price, item.num, serials, create_time]
    } else {
        sqlStr = `INSERT INTO orders(buyer_id,production_id,production_type,price,num,serials,create_time) VALUE`;
        for (let i = 0, len = list.length; i < len; i++) {
            let item = list[i]
            sqlStr += i === 0 ? "" : ","
            sqlStr += '(?,?,?,?,?,?,?)'
            sqlData.push(item.userId)
            sqlData.push(item.itemId)
            sqlData.push(item.type)
            sqlData.push(item.price)
            sqlData.push(item.num)
            sqlData.push(serials)
            sqlData.push(create_time)
        }
    }
    return new Promise((resolve, reject) => {
        // 查询实例
        db.query(sqlStr, sqlData, function(result, fields) {
            console.log('插入结果:', result);
            let resData = {};
            resData.status = 'success';
            resData.msg = '生成订单成功';
            resData.serials = serials;
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

// 确认订单(归档订单,等待付款发货等一系列后续步骤)
let archiveOrder = function(data) {
    let params = data.PARAMS;
    let sqlStr = `UPDATE orders SET state=1,address_id=? WHERE serials=?`
    let sqlData = [params.address_id, params.serials]
    return new Promise((resolve, reject) => {
        // 查询实例
        db.query(sqlStr, sqlData, function(result, fields) {
            console.log('归档成功:' + params.serials);
            let resData = {};
            resData.status = 'success';
            resData.msg = '归档成功:' + params.serials;
            resData.serials = params.serials;
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

// 修改地址
let saveAddress = function(data) {
    let params = data.PARAMS;
    let sqlStr = `UPDATE address SET user_id=?,receiver_name=?,receiver_phone=?,receiver_area=?,receiver_area_code=?,receiver_address=?  WHERE id=?`;
    let sqlData = [params.senderId, params.name, params.phone, params.area, params.areaCode, params.address, params.id]
    return new Promise((resolve, reject) => {
        // 查询实例
        db.query(sqlStr, sqlData, function(result, fields) {
            console.log('修改结果:', result);
            let qurSql = `SELECT receiver_name AS name,receiver_phone AS phone,receiver_area AS area,receiver_area_code AS areaCode,receiver_address AS address FROM address WHERE user_id=${params.senderId}`
            db.query(qurSql, [], function(qurResult) {
                let resData = {};
                resData.status = 'success';
                resData.msg = '修改成功';
                resData.list = qurResult;
                resolve(resData);
            })
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
    orderServer: fn_orderServer,
}

// queryProductions({ PARAMS: { num: 10, pageNum: 0 } });
// queryOrder({ PARAMS: { serials: "XM1560310324251" } });
// getProductionById({ PARAMS: { id: "527106977940" } })
// creatOrder({
//     PARAMS: {
//         list: [{
//                 type: '红色-大',
//                 num: 9,
//                 price: 400,
//                 itemId: 566476976584,
//                 userId: '1'
//             },
//             {
//                 type: '红色-小',
//                 num: 31,
//                 price: 200,
//                 itemId: 567147292793,
//                 userId: '1'
//             }
//         ]
//     }
// });