'use strict';


const db = require('../utils/xmonshopSql'); // 引入数据库
const tokenUtil = require('../utils/tokenUtil'); // token工具

let fn_addressServer = async function(method, data) {
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



// 查询地址列表
let queryAddress = function(data) {
    let params = data.PARAMS;
    let sqlStr = `SELECT id,user_id AS send_id,receiver_name AS name,receiver_phone AS phone,receiver_area AS area,receiver_area_code AS areaCode,receiver_address AS address FROM address WHERE user_id=${params.id}`
    let sqlData = []

    return new Promise((resolve, reject) => {
        // 查询实例
        db.query(sqlStr, sqlData, function(result, fields) {
            console.log('查询结果:%s', result.length);
            let resData = {};
            resData.status = 'success';
            resData.list = result;
            resolve(resData);
        });

    });
}

// 增加地址
let addNewAddress = function(data) {
    let params = data.PARAMS;

    let sqlStr = `INSERT INTO address(user_id,receiver_name,receiver_phone,receiver_area,receiver_area_code,receiver_address) VALUES(?,?,?,?,?,?)`;
    let sqlData = [params.senderId, params.name, params.phone, params.area, params.areaCode, params.address]

    return new Promise((resolve, reject) => {
        // 查询实例
        db.query(sqlStr, sqlData, function(result, fields) {
            console.log('插入结果:', result);
            let qurSql = `SELECT receiver_name AS name,receiver_phone AS phone,receiver_area AS area, receiver_area_code AS areaCode,receiver_address AS address FROM address WHERE user_id=${params.senderId}`
            db.query(qurSql, [], function(qurResult) {
                let resData = {};
                resData.status = 'success';
                resData.msg = '插入成功';
                resData.list = qurResult;
                resolve(resData);
            })
        });

    });
}

// 修改地址
let saveAddress = function(data) {
    let params = data.PARAMS;

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

    });
}

module.exports = {
    addressServer: fn_addressServer,
}

// queryAddress({ PARAMS: { id: 1 } });
// addNewAddress({ PARAMS: { name: "11cees", phone: "12341234", area: "北京市 市辖区 东城区", address: "asdf1", senderId: "1" } });
// saveAddress({ PARAMS: { name: "cqqwttt11", phone: "12341234", area: "北京市 市辖区 东城区", address: "asdf1", senderId: "1", id: 1 } });