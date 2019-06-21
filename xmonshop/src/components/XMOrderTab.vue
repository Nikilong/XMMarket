<template>
    <div class="bg-common container">
        <div class="tab_header">
            <tab bar-position="bottom" :scroll-threshold="2">
                <!-- <tab-item :selected="selectTabIndex===0" :badge-label="4" @on-item-click="onItemClick" slot>待付款<div>11</div></tab-item> -->
                <tab-item :selected="selectTabIndex===0" @on-item-click="onItemClick">全部</tab-item>
                <tab-item :selected="selectTabIndex===1" @on-item-click="onItemClick">待付款</tab-item>
                <tab-item :selected="selectTabIndex===2" @on-item-click="onItemClick">待发货</tab-item>
                <tab-item :selected="selectTabIndex===3" @on-item-click="onItemClick">待收货</tab-item>
                <tab-item :selected="selectTabIndex===4" @on-item-click="onItemClick">待评价</tab-item>
                <tab-item :selected="selectTabIndex===5" @on-item-click="onItemClick">退货/退款</tab-item>
            </tab>
        </div>
        <div v-if="selectTabIndex===0||selectTabIndex===1">
             <div class="cars_container">
                <div class="pro_cell" v-if="ordersData.length>0" v-for="item,daIndex in ordersData">
                    <div class="pro_cell_header"><p>待付款</p></div>
                    <div class="pro_cell_content">
                        <div class="pro_cell_img" @click="openItem(item)">
                            <img class="pro_img" :src="item.pic">
                        </div>
                        <div class="pro_cell_msg">
                            <p class="pro_cell_title">{{item.itemName}}</p>
                            <p class="pro_cell_type">{{item.type}}<span style="float:right;">￥{{item.price}}  x{{item.num}}</span></p>
                        </div>
                    </div>
                    <div class="pro_cell_ft">
                        <p>共{{item.num}}件商品 合计:￥{{item.price * item.num}}</p>
                        <div class="pro_cell_ft_tools">
                            <button>删除订单</button>
                            <button>卖了换钱</button>
                            <button>评论</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
            
        <!-- <div v-if="showEmptyOrderMsg" class="empty_tips"> -->
        <div v-else class="empty_tips">
            <img class="empty_tips_img" src="../assets/setting/setting-ser-fwtk.svg">
            <div class="empty_tips_lab">暂时没有相关订单</div>
        </div>
    </div>
</template>



<script>

import commonUtil from "../common/common"
import { Tab, TabItem  } from "vux"


export default {
    name: "xmorderTab",
    components: {
        Tab, TabItem 
        },
    props:[],
    data() {
        return {
            selectTabIndex:0, // 当前选中的tab
            ordersData:[], // 订单类信息
            showEmptyOrderMsg:false,  // 无相关订单消息
        }
    },
    computed: {},
    methods: {
        avalidToken:function(callback,failedCallback) //检查token是否有效
        {
            let userId = commonUtil.getCookie("_userId")
            let token = commonUtil.getCookie("_accesstoken")

            let result = {}
            if(userId.trim().length > 0 && token.trim().length > 0){
                let data = {
                    HEADER: {},
                    PARAMS: {userId:userId,accesstoken:token},
                    SERVICE: "LoginService.validToken"
                }
                let _this = this;
                this.$axios({
                    url: commonUtil.serverUri(),
                    method: "post",
                    data: data
                })
                .then(function(response){
                        console.log(response.data)
                        if (response.data.status === "success") {
                            callback && callback(response.data)
                        } else {
                            failedCallback && failedCallback(response.data)
                        }
                })
            }else{
                result.status = "failed"
                result.msg = "userId或者acctoken不存在"
                failedCallback && failedCallback(result)
            }
        },
        onItemClick:function(index){
            // console.log(a,b)
            this.selectTabIndex = index
        },
        queryCarts:function(){
            let _this = this
            this.avalidToken(function(result){
                let data = {
                        HEADER: {},
                        PARAMS: {id:commonUtil.getCookie("_userId")},
                        SERVICE: "ShopService.queryCart"
                    };
                _this.$axios({
                    url: commonUtil.serverUri(),
                    method: "post",
                    data: data
                }).then(function(response) {
                    console.log(response.data);
                    if (response.data.status === "success") {
                        _this.ordersData = Array.from(response.data.cartList)
                        console.log("8989",_this.ordersData)
                        _this.showEmptyOrderMsg = response.data.cartList.length>0 ? false :true
                    } else {
                        alert(response.data.msg)
                    }
                });
            },function(err){
            })
        },
        openItem:function(){

        },
    },
    created: function() {
        window.postMessage("hideTabbar","*")
        let index = commonUtil.getQueryString("tabIndex")
        console.log(["0","1","2","3","4","5"].indexOf(index))
        if(["0","1","2","3","4","5"].indexOf(index) > -1){
            this.selectTabIndex = Number(index)
        }else{
            this.selectTabIndex = 0
        }
        this.queryCarts()
    },
};
</script>

<style  scoped>
.container{
    height: 100%;
    width: 100%;
    overflow-y: scroll;
}

.tab_header{
    position: fixed;
    z-index: 999;
    top:0;
    left: 0;
    right: 0;
}
.cars_container{
    height: 100%;
    padding-top: 2.5rem;
    padding-bottom: 1rem;
    overflow-y: scroll;
}

.pro_cell{
    display: flex;
    position: relative;
    justify-content: center;
    flex-direction: column;
    padding:0.5rem;
    background: white;
    margin: 0.5rem;
    border-radius: 1rem;
}

.pro_cell p{
    margin:0 0.5rem;
    padding: 0.3rem 0.5rem;
}

.pro_cell_header{
    display: flex;
    position: relative;
    justify-content: flex-end;
    font-size: 1rem;
    line-height: 1rem;
    color:#4D3126;
}

.pro_cell_content{
    display: flex;
    position: relative;
    justify-content: center;
    align-items:flex-start;
    height: 5rem;
    margin: 0.3rem 0;
}
.pro_cell_ft{
    display: flex;
    position: relative;
    flex-direction: column;
    align-items: flex-end;
}
.pro_cell_ft_tools{
    padding-right: 1rem;
}
.pro_cell_ft_tools button{
    border:1px solid #4D3126;
    border-radius: 0.5rem;
    background: white;
    color: #2C3E50;
    margin:0.3rem 0;
}

.pro_cell_img{
    flex:3;
}
.pro_cell_msg{
    flex:12;
    text-align:left;
}
.pro_cell_title{
    font-size: .8rem;
}
.pro_cell_type{
    font-size: .6rem;
    background: #eeeeee;
    border-radius: 0.2rem;
}
.pro_cell_price{
    font-size: 1rem;
}
.pro_img{
    width:4.6rem;
    height:4.6rem;
}


.empty_tips{
    width:100%;
    height: 100%;
    background: white;
}

.empty_tips img{
    padding-top: 7rem;
    width:5rem;
    height: 5rem;
}


</style>

