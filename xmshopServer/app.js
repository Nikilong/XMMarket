'use strict'
// koa2 针对ES7 语法
const Koa = require("koa")
const controller = require("./controller")
const bodyPar = require("koa-bodyparser")
const cors = require("koa-cors")
const koaBody = require('koa-body')

const app = new Koa()
const port = 4001

app.use(cors())
app.use(koaBody({ multipart: true }))

app.use(async(ctx, next) => {
    console.log(`${ctx.request.method} ${ctx.request.url}`)
        // ctx.status = 302;
        // ctx.redirect("http://www.baidu.com")
        // return;
    if (String(ctx.request.url).indexOf("/favicon.ico") > -1) {
        ctx.response.status = 403
    } else {
        await next();
    }

})

app.use(bodyPar())


app.use(controller())

app.listen(port)
console.log('app started at port %s...', port)