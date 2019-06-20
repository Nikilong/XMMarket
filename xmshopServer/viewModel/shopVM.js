'use strict';


const db = require('../utils/xmonshopSql'); // 引入数据库
const tokenUtil = require('../utils/tokenUtil'); // token工具

let fn_shopServer = async function(method, data) {
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

// 获取商品清单
let queryProductions = function(data) {
    let params = data.PARAMS;
    if (!params.num || !params.pageNum) {
        params.num = 10;
        params.pageNum = 0;
    }
    let sqlStr = `select * from shop`;

    return new Promise((resolve, reject) => {
        // 查询实例
        db.query(sqlStr, [], function(result, fields) {
            console.log('查询结果：%s', result.length);
            let resData = {};
            resData.totalNum = result.length;
            if (result.length > 0) {
                let startNum = params.num * params.pageNum
                let sqlStrPage = `SELECT * FROM shop ORDER BY lastModify DESC LIMIT ${startNum},${params.num}`; // limit 0,10,按修改时间顺序排(最近修改的排在最上面)
                db.query(sqlStrPage, [], function(pageResult, fields) {
                    console.log('查询结果：%s', pageResult.length);
                    if (pageResult.length > 0) {
                        resData.status = 'success';
                        resData.list = pageResult;
                    } else {
                        resData.msg = '没有更多相关的商品';
                        resData.status = 'falied';
                    }
                    resolve(resData);
                });
            } else {
                resData.msg = '没有相关的商品';
                resData.status = 'falied';
                resolve(resData);
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

// 查询商品详情
let getProductionById = function(data) {
    let params = data.PARAMS
    let resData = {}
    return new Promise((resolve, reject) => {
        let sqlStr = `select * from shop where itemId=${params.id}`
        db.query(sqlStr, [], function(result) {
            console.log("查询结果:" + result.length)
            resData.status = 'success'
            resData.RESULT = result
            resolve(resData)
        })
    }).catch(e => {
        console.log(e)
        let resData = {}
        resData.status = "failed"
        resData.msg = e.message
        return resData
    })

}

// 删除商品
let deleteProductionById = function(data) {
    let params = data.PARAMS
    let resData = {}
    return new Promise((resolve, reject) => {
        let sqlStr = `delete from shop where itemId=${params.id}`
        db.query(sqlStr, [], function(result) {
            console.log("查询结果:" + result)
            resData.status = 'success'
            resData.RESULT = result
            resolve(resData)
        })
    }).catch(e => {
        console.log(e)
        let resData = {}
        resData.status = "failed"
        resData.msg = e.message
        return resData
    })

}

// 查询购物车
let queryCart = function(data) {
    let params = data.PARAMS;
    return new Promise((resolve, reject) => {
        let sqlStr = `select * from cart where userId=${params.id};`
        db.query(sqlStr, [], function(result) {
            console.log("查询购物车结果:" + esult.length)
            let resData = {}
            resData.status = "success"
            resData.cartList = result;
            resolve(resData)
        });

    }).catch(e => {
        console.log(e)
        let resData = {}
        resData.status = "failed"
        resData.msg = e.message
        return resData
    })
}

// 加入购物车
let addToCart = function(data) {
    let params = data.PARAMS;
    return new Promise((resolve, reject) => {
        let checkSql = `select * from cart where itemId=? and userId=? and type=? and price=?`
        let checkArr = [params.itemId, params.userId, params.type, params.price]
            // 先查询,如果已经存在,就修改数量,否则新插入数据
            // 注意需要比较的条件是用户,商品,型号,价格需要严格符合才算同一条
        db.query(checkSql, checkArr, function(result, fields) {
            console.log('已存在该商品需要更新数量' + params.num);
            let resData = {};
            if (result.length > 0) {
                let upNum = Number(result[0].num) + Number(params.num);
                let upSql = `update cart set num=? where itemId=? and userId=? and type=? and price=? `
                let upArr = [upNum, params.itemId, params.userId, params.type, params.price]
                db.query(upSql, upArr, function(result) {
                    // 返回最新的数据
                    db.query(`select * from cart where userId=${params.userId}`, [], function(result, fields) {
                        console.log('购物车查询结果:' + result.length);
                        resData.status = 'success';
                        resData.msg = '购物车已添加该商品数量:' + upNum;
                        resData.cartList = result;
                        resolve(resData);
                    });
                })
            } else {
                // 插入新数据
                let insertStr = `insert into cart(itemId,userId,pic,type,price,num,itemName) values(?,?,?,?,?,?,?);`
                let insertArr = [params.itemId, params.userId, params.pic, params.type, params.price, params.num, params.itemName]
                    // 查询实例
                db.query(insertStr, insertArr, function(result, fields) {
                    console.log('购物车查询结果:' + result.length);
                    db.query(`select * from cart where userId=${params.userId}`, [], function(result, fields) {
                        console.log('购物车:' + result.length);
                        resData.status = 'success';
                        resData.msg = '添加入购物车成功';
                        resData.cartList = result;
                        resolve(resData);
                    });
                })
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

// 删除购物车的货品
let deleteProduction = function(data) {
    let params = data.PARAMS;
    return new Promise((resolve, reject) => {
        let checkSql = `delete from cart where itemId=? and userId=? and type=? and price=?`
        let checkArr = [params.itemId, params.userId, params.type, params.price]
            // 先查询,如果已经存在,就修改数量,否则新插入数据
            // 注意需要比较的条件是用户,商品,型号,价格需要严格符合才算同一条
        db.query(checkSql, checkArr, function(result, fields) {
            console.log('已删除商品');
            // 返回最新的数据
            db.query(`select * from cart where userId=${params.userId}`, [], function(result, fields) {
                console.log('购物车查询结果:' + result.length);
                let resData = {}
                resData.status = 'success';
                resData.msg = '购物车已删除该商品';
                resData.cartList = result;
                resolve(resData);
            });
        });

    }).catch(e => {
        console.log(e)
        let resData = {}
        resData.status = "failed"
        resData.msg = e.message
        return resData
    })
}

// 更新购物车货品的数量
let updateProductionNum = function(data) {
    let params = data.PARAMS;
    return new Promise((resolve, reject) => {
        let checkSql = `UPDATE cart SET num=${params.num} where id=${params.id}`
        db.query(checkSql, [], function(result, fields) {
            console.log('更新商品数量');
            // 返回最新的数据
            let resData = {}
            resData.status = 'success';
            resData.msg = '购物车已更新该商品数量为' + params.num;
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

// 更新购物车货品的型号
let updateProductionType = function(data) {
    let params = data.PARAMS;
    return new Promise((resolve, reject) => {
        let selSql = `SELECT * from cart WHERE itemId=? AND userId =? AND type=?`
        let selData = [params.itemId, params.userId, params.type]
        db.query(selSql, selData, function(selRes) {
            if (selRes.length > 0 && selRes[0].id != params.id) {
                let delSql = `DELETE FROM cart where id=${params.id}`
                db.query(delSql, [], function(result, fields) {
                    // 返回最新的数据
                    let resData = {}
                    resData.status = 'success'
                    resData.msg = '删除旧的型号数据'
                    resData.delete = true
                    resolve(resData)
                });
            } else if (selRes.length == 0) {
                let upSql = `UPDATE cart SET type='${params.type}' WHERE id=${params.id}`
                db.query(upSql, [], function(result, fields) {
                    console.log('更新商品型号');
                    // 返回最新的数据
                    let resData = {}
                    resData.status = 'success'
                    resData.msg = '购物车已更新该商品型号'
                    resolve(resData);
                });

            } else {
                let resData = {}
                resData.status = 'success'
                resData.msg = '无需更改型号'
                resolve(resData);
            }
        })

    }).catch(e => {
        console.log(e)
        let resData = {}
        resData.status = "failed"
        resData.msg = e.message
        return resData
    })
}

module.exports = {
    shopServer: fn_shopServer,
}

// queryProductions({ PARAMS: { num: 10, pageNum: 0 } });
// queryCart({ PARAMS: { userId: 2 } });
// getProductionById({ PARAMS: { id: "527106977940" } })
// updateProductionNum({ PARAMS: { id: 72, num: 13} })
// updateProductionType({ PARAMS: { id: 94, userId: "2", itemId: 566476976584, type: "蓝-中" } })

// addToCart({
//     PARAMS: {
//         itemId: 6197407362,
//         num: 2,
//         pic: "//img.alicdn.com/bao/uploaded/i5/T1kYJGXeNnXXctEDUY_030700.jpg",
//         price: 400,
//         type: "红色-大",
//         userId: "1"
//     }
// });