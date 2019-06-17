'use strict';


const db = require('../utils/xmonshopSql'); // 引入数据库
const tokenUtil = require('../utils/tokenUtil'); // token工具

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

    let serials = "XM" + Date.now() // todo:流水号
    let sqlStr = `INSERT INTO orders(buyer_id,production_id,production_type,price,num,serials,create_time) VALUE(?,?,?,?,?,?,now())`;
    let sqlData = [params.userId, params.itemId, params.type, params.price, params.num, serials]

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

// 修改地址
let saveAddress = function(data) {
    let params = data.PARAMS;
    if (!params.num || !params.pageNum) {
        params.num = 10;
        params.pageNum = 0;
    }
    let sqlStr = `UPDATE address SET user_id=?,receiver_name=?,receiver_phone=?,receiver_area=?,receiver_area_code=?,receiver_address=?  WHERE id=?`;
    let sqlData = [params.senderId, params.name, params.phone, params.area, params.areaCode, params.address, params.id]
    console.log(sqlData)
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
//         type: "红色-大-大-大",
//         num: 1,
//         price: 1000,
//         itemId: 522552183880,
//         userId: "2"
//     }
// });