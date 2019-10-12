'use strict';

const request = require('request');
const httpUtil = require('../utils/httpUtil');
        
let fn_newsServer = async function(method, data) {
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


// 返回url的image的base64编码  return string
let getBase64ImageString = function(data) {
    let params = data.PARAMS
    console.log("------",params.url)
    return httpUtil.getBase64String(params.url)
}
// 查询新闻详情
let getNewsDetail = function(data) {
    let params = data.PARAMS
    console.log("------",params.id)
    let weburl = `http://m.uczzd.cn/webview/news?app=uc-iflow&aid=${params.id}&cid=100&zzd_from=uc-iflow&uc_param_str=dndsfrvesvntnwpfgicp&recoid=3902548323263252739&rd_type=reco&sp_gz=1`;
    return httpUtil.getHTML(weburl)
}

// 查询新闻列表
let getNewsByChannel = function(data) {
    let params = data.PARAMS
    let resData = {}
    let cityName= "%E5%B9%BF%E5%B7%9E"
    if(params.cityName){
        cityName = params.cityName
    }
    console.log("---city:",decodeURI(cityName),params.id)
    return new Promise((resolve, reject) => {
        request(`http://iflow.uczzd.cn/iflow/api/v1/channel/${params.id}?app=uc-iflow&sp_gz=1&city_name=${cityName}&recoid=4780413596505591035&ftime=1488170672207&method=new&count=20&no_op=0&auto=0&content_ratio=0&_tm=1488170686131&sign=bTkwBf9iQB%2F%2B%2F%2BHW3ogpeRxXTASXxQkcussc021pvCbY8PhRcDeSzLbM&sc=&uc_param_str=dnnivebichfrmintcpgieiwidsudsvli&dn=20151536891-fdd83270&ni=bTkwBTRiltTM%2FB%2BoM9%2BSzKFTH%2Fw9my2pBssWYs9s4gujq%2F0%3D&ve=10.9.6.755&bi=997&fr=iphone&mi=iPhone8%2C1&nt=2&cp=isp%3A%E7%94%B5%E4%BF%A1%3Bprov%3A%E5%B9%BF%E4%B8%9C%3Bcity%3A%3Bna%3A%E4%B8%AD%E5%9B%BD%3Bcc%3ACN%3Bac%3A&ei=bTkwBcdiqTSojXfM8KyHGJdaY7Z1jg5t1b9yZ4hg%2B347oiyKCUxxdgEfSBZKXw%3D%3D&ds=bTkwBepirf3loQ6QrJ76djgUEWU26yiBFIsxt2oP%2FNcXoQ%3D%3D&ud=bTkwBQ1isdG7gH35p53uwnMKCofF7Sj45ZQil%2B8I6hf4tQ%3D%3D&sv=app&li=g9qKibW4p5yD14qJsbysy4%2Fa04ji5%2FOd7ui%2F`, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log(body) // Show the HTML for the baidu homepage.
                // 将string类型的body数据转为array
                let dict = JSON.parse(body).data.articles
                let result = []
                for(let key in dict){
                    result.push(dict[key])
                }
                resData.status = 'success'
                resData.RESULT = result
            }else{
                resData.status = 'failed'
                resData.RESULT = '无法获取数据'
                
            }
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

// 搜索新闻
let searchNews = function(data) {
    let params = data.PARAMS
    let resData = {}
    console.log("------",params.keyword)
    let keyword = ""
    if(params.keyword){
        keyword = encodeURI(params.keyword)
    }
    let weburl =`http://mbsug.ssl.so.com/sug?channel=type_webpage&caller=strict&sensitive=strict&srcg=sina_shoulang_act&word=$${keyword}&callback=__jp4`;
    console.log(weburl)
    return new Promise((resolve, reject) => {
        request(weburl, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log(body) // Show the HTML for the baidu homepage.
                // 将string类型的body数据转为JSON
                let dict = {}
                try{
                    let str = body.substring(body.indexOf("(") + 1,body.indexOf(")"))
                    dict = JSON.parse(str)
                }catch(e){console.log(e)}
                resData.status = 'success'
                resData.RESULT = dict
            }else{
                resData.status = 'failed'
                resData.RESULT = '无法获取数据'
                
            }
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

// 下载图片
let downloadImage = function(data) {
    let params = data.PARAMS
    let resData = {}
    console.log("------",params.url)
    return new Promise((resolve, reject) => {
        request.get({
            url: `${CONFIG.api.speechMark}/file/download?filePath=${req.body.filePath}`,
            json: req.body,
            gzip:true,
            headers:{
                'Content-Type': 'application/octet-stream',
            },
        }).on('response', function(response) {
            console.log(response.statusCode) // 200
            console.log(response.headers)
            // console.log(response.headers['content-type']) // 'image/png'
            // res.headers['content-type'] = response.headers['content-type']
            this.pipe(res)
          });
        request(`http://iflow.uczzd.cn/iflow/api/v1/channel/${params.id}?app=uc-iflow&sp_gz=1&city_name=%E5%B9%BF%E5%B7%9E&recoid=4780413596505591035&ftime=1488170672207&method=new&count=20&no_op=0&auto=0&content_ratio=0&_tm=1488170686131&sign=bTkwBf9iQB%2F%2B%2F%2BHW3ogpeRxXTASXxQkcussc021pvCbY8PhRcDeSzLbM&sc=&uc_param_str=dnnivebichfrmintcpgieiwidsudsvli&dn=20151536891-fdd83270&ni=bTkwBTRiltTM%2FB%2BoM9%2BSzKFTH%2Fw9my2pBssWYs9s4gujq%2F0%3D&ve=10.9.6.755&bi=997&fr=iphone&mi=iPhone8%2C1&nt=2&cp=isp%3A%E7%94%B5%E4%BF%A1%3Bprov%3A%E5%B9%BF%E4%B8%9C%3Bcity%3A%3Bna%3A%E4%B8%AD%E5%9B%BD%3Bcc%3ACN%3Bac%3A&ei=bTkwBcdiqTSojXfM8KyHGJdaY7Z1jg5t1b9yZ4hg%2B347oiyKCUxxdgEfSBZKXw%3D%3D&ds=bTkwBepirf3loQ6QrJ76djgUEWU26yiBFIsxt2oP%2FNcXoQ%3D%3D&ud=bTkwBQ1isdG7gH35p53uwnMKCofF7Sj45ZQil%2B8I6hf4tQ%3D%3D&sv=app&li=g9qKibW4p5yD14qJsbysy4%2Fa04ji5%2FOd7ui%2F`, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log(body) // Show the HTML for the baidu homepage.
                // 将string类型的body数据转为array
                let dict = JSON.parse(body).data.articles
                let result = []
                for(let key in dict){
                    result.push(dict[key])
                }
                resData.status = 'success'
                resData.RESULT = result
            }else{
                resData.status = 'failed'
                resData.RESULT = '无法获取数据'
                
            }
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



module.exports = {
    newsServer: fn_newsServer,
}
