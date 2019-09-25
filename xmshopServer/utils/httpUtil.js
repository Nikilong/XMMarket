'use strict';

const http = require('http')

let fn_getHTML= function(url){
    return new Promise((resolve, reject) => {
        // 参数url 和 回调函数
        http.get(url, function (res) {
          var html = '';
          // 绑定data事件 回调函数 累加html片段
          res.on('data', function (data) {
            html += data;
          });
      
          res.on('end', function () {
            console.log("end",html.length)
            let resData = {}
            resData.status = 'success'
            resData.RESULT = html
            resolve(resData)
          });
        }).on('error', function () {
          console.log('获取数据错误');
        });
    }).catch(e => {
        console.log(e)
        let resData = {}
        resData.status = "failed"
        resData.msg = e.message
        return resData
    })

}

let fn_getBase64ImageString= function(url){
    return new Promise((resolve, reject) => {
        http.get(url,function(res){
        　　var chunks = []; //用于保存网络请求不断加载传输的缓冲数据
        　　var size = 0;　　 //保存缓冲数据的总长度
        　　res.on('data',function(chunk){
        　　　　chunks.push(chunk);　 //在进行网络请求时，会不断接收到数据(数据不是一次性获取到的)，
        　　　　　　　　　　　　　　　　//node会把接收到的数据片段逐段的保存在缓冲区（Buffer），
        　　　　　　　　　　　　　　　　//这些数据片段会形成一个个缓冲对象（即Buffer对象），
        　　　　　　　　　　　　　　　　//而Buffer数据的拼接并不能像字符串那样拼接（因为一个中文字符占三个字节），
        　　　　　　　　　　　　　　　　//如果一个数据片段携带着一个中文的两个字节，下一个数据片段携带着最后一个字节，
        　　　　　　　　　　　　　　　　//直接字符串拼接会导致乱码，为避免乱码，所以将得到缓冲数据推入到chunks数组中，
        　　　　　　　　　　　　　　　　//利用下面的node.js内置的Buffer.concat()方法进行拼接

        　　　　　　　　　
        　　　　size += chunk.length;　　//累加缓冲数据的长度
        　　});

        　　res.on('end',function(err){
        　　　　var data = Buffer.concat(chunks, size);　　//Buffer.concat将chunks数组中的缓冲数据拼接起来，返回一个新的Buffer对象赋值给data
        // 　　　　console.log(Buffer.isBuffer(data));　　　　//可通过Buffer.isBuffer()方法判断变量是否为一个Buffer对象
        　　　　var base64Img = data.toString('base64');　　//将Buffer对象转换为字符串并以base64编码格式显示
                let resData = {}
                resData.status = 'success'
                resData.RESULT = base64Img
                resolve(resData)

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


module.exports = {
    getHTML: fn_getHTML,
    getBase64String: fn_getBase64ImageString,
}

// let url = "http://m.uczzd.cn/webview/news?app=uc-iflow&aid=3260426774034187374&cid=100&zzd_from=uc-iflow&uc_param_str=dndsfrvesvntnwpfgicp&recoid=3902548323263252739&rd_type=reco&sp_gz=1";
// fn_getHTML(url);