'use strict';

const loginVM = require('../viewModel/loginVM') // 处理登录类相关
const shopVM = require('../viewModel/shopVM') // 处理商品类相关
const addressVM = require('../viewModel/addressVM') // 处理地址类相关
const orderVM = require('../viewModel/orderVM') // 处理订单类相关

var fn_servlet = async(ctx, next) => {
    console.log(`request for: ${ctx.request.body.SERVICE}`);
    let data = null;
    try {
        if (ctx.request.body.SERVICE) {
            let methodJson = String(ctx.request.body.SERVICE).split(".");
            switch (methodJson[0]) {
                case "LoginService":
                    data = await loginVM.loginServer(methodJson[1], ctx.request.body);
                    break;
                case "ShopService":
                    data = await shopVM.shopServer(methodJson[1], ctx.request.body);
                    break;
                case "AddressService":
                    data = await addressVM.addressServer(methodJson[1], ctx.request.body);
                    break;
                case "OrderService":
                    data = await orderVM.orderServer(methodJson[1], ctx.request.body);
                    break;
                default:
                    console.log("error")
                    break;
            }
        }
    } catch (e) {
        let error = {};
        error.name = e.name;
        error.message = e.message;
        data.error = error
    }
    console.log(`---请求结束:${ctx.request.body.SERVICE}`)
    if (data.error) {
        ctx.status = 500;
    }
    ctx.response.body = data;
}

module.exports = [{
    method: "POST",
    path: "/servers",
    func: fn_servlet
}, ];