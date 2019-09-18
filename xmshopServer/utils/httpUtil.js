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
            console.log(html)
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

module.exports = {
    getHTML: fn_getHTML,
}

// let url = "http://m.uczzd.cn/webview/news?app=uc-iflow&aid=3260426774034187374&cid=100&zzd_from=uc-iflow&uc_param_str=dndsfrvesvntnwpfgicp&recoid=3902548323263252739&rd_type=reco&sp_gz=1";
// fn_getHTML(url);