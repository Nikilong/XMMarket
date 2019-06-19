<template>
    <!-- <div class="container" :class="{'animate_pullDown':hideCarts,'animate_pullUp':!hideCarts}"> -->
    <div class="container">
        <div class="cars_container">
            <div class="pro_cell" v-if="cartsData.length>0" v-for="item,daIndex in cartsData">
                <div class="pro_cell_checkbox">
                    <div @click="changeCheckbox(item.id)" class="check_box_empty" :class="{'check_box_select':selectProIds.indexOf(item.id) >-1}"></div>
                </div>
                <div class="pro_cell_img">
                    <img class="pro_img" :src="item.pic">
                </div>
                <div class="pro_cell_msg">
                    <p class="pro_cell_title">{{item.itemName}}</p>
                    <p class="pro_cell_type">{{item.type}}</p>
                    <p class="pro_cell_price c_red">￥{{item.price}}</p>
                    <div style="position: relative;">
                        <x-number @on-change="changeProNum(daIndex)" style="position: absolute;right:-2rem;bottom:-.5rem;transform:scale(0.7);" align="right"  button-style="square" :min="1" :max="99" v-model="item.num"></x-number>
                    </div>
                </div>
                <div class="pro_cell_checkbox">
                    <div @click.prevent="deleteProAtIndex(daIndex)" class="pro_cell_del_btn"></div>
                </div>
            </div>
        </div>
        <div v-if="showEmptyCartMsg" class="empty_tips">
            <img class="empty_tips_img" src="../assets/icons/empty_cart_icon.svg">
            <div class="empty_tips_lab">你的购物车君空空的</div>
        </div>
        <div v-if="showLoginTips" class="empty_tips">
            <img class="empty_tips_img" src="../assets/icons/empty_cart_icon.svg">
            <div class="empty_tips_lab">请先登录,<button @click="toLogin">登录</button></div>
        </div>

        <div class="ft_bar">
            <div class="tool_bar">
                <div class="flex_tab_btn" @click="selectOrUnselectAll"><span class="check_box_empty" :class="{'check_box_select':selectProIds.length===cartsData.length&&cartsData.length>0}"></span><span class="c-gray">{{selectProIds.length===cartsData.length&&cartsData.length>0?"反选":"全选"}}</span></div>
                <!-- <div class="flex_tab_btn" @click="calltoBack"><span class="back_icon"></span><span>返回</span></div> -->
                <div class="flex_btn" style="color: black;"><span v-if="selectProIds.length > 0">合计:<span class="c_red total_price_lab">￥{{totalPrice}}</span></span></div>
                <div class="flex_btn" :class="{'bg-darkgray':selectProIds.length>0,'bg-lightgray':selectProIds.length===0}"  @click="createOrder">结算<span v-if="selectProIds.length > 0">({{selectProIds.length}})</span></div>
            </div>
        </div>
        
    </div>
</template>


<script>
import commonUtil from "../common/common";
import {Cell,Checklist,XNumber} from "vux";
import { setTimeout } from 'timers';

export default {
    name:'xmcarts',
    components:{
        Checklist,Cell,XNumber
    },
    computed:{
        totalPrice:function(){ // 总价
            let totalP = 0;
            for(let i=0;i<this.selectProIds.length;i++){
                for(let j=0;j<this.cartsData.length;j++){
                    let ele = this.cartsData[j]
                    if(ele.id === this.selectProIds[i]){
                        totalP += ele.num * ele.price
                        break
                    }
                }
            }
            return totalP;
        }

    },
    data(){
        return {
            cartsData:[], // 商品数据
            selectProIds:[],  // 勾选商品id
            hideCarts:false,  // 隐藏购物车
            showEmptyCartMsg:false, // 空的购物车的占位符
            showLoginTips:false,  // 是否需要登录
        }
    },
    methods:{
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
                        _this.cartsData = Array.from(response.data.cartList)
                        _this.showEmptyCartMsg = response.data.cartList.length>0 ? false :true
                        document.title = response.data.cartList.length>0 ? ("购物车("+response.data.cartList.length+")"):"购物车"
                        window.postMessage("updataCartsCount--"+_this.cartsData.length,"*")
                    } else {
                        alert(response.data.msg)
                    }
                });
            },function(err){
                _this.showLoginTips = true
            })
        },
        selectOrUnselectAll:function(){
            if(this.selectProIds.length === this.cartsData.length){
                this.selectProIds = []
            }else{
                this.selectProIds = []
                for(let i=0;i<this.cartsData.length;i++){
                    this.selectProIds.push(this.cartsData[i].id)
                }
            }
        },
        changeCheckbox:function(id){
            let index = this.selectProIds.indexOf(id)
            if(index >= 0){
                this.selectProIds.splice(index,1)
            }else{
                this.selectProIds.push(id)
            }

        },
        calltoBack:function () {
            window.history.back()
            // // 执行动画再切换
            // let _this = this
            // this.hideCarts = true
            // setTimeout(function(){
            //     _this.hideCarts = false
            //     // _this.$emit("backStep")
            // },250)
        },
        deleteProAtIndex:function(index){
            let item = this.cartsData[index]
            let data = {
                HEADER: {},
                PARAMS: item,
                SERVICE: "ShopService.deleteProduction"
            }
            let _this = this;
			this.$axios(
            {
                url: commonUtil.serverUri(),
                method: "post",
                data: data
            }).then(function(response) 
            {
                console.log(response.data)
                if (response.data.status === "success") {
                    _this.cartsData = Array.from(response.data.cartList);
                    _this.changeCheckbox(item.id)
                    window.postMessage("updataCartsCount--"+_this.cartsData.length,"*")
                } else {
                    alert(response.data.msg)
                }
			});
        },
        changeProNum:function (index){  // 商品数量改变事件
            let item = this.cartsData[index]
            this.saveProNum(item)
        },
        saveProNum:function (item){
            let _this = this
            this.avalidToken(function(result){
                let data = {
                        HEADER: {},
                        PARAMS: {id:item.id,num:item.num},
                        SERVICE: "ShopService.updateProductionNum"
                    };
                _this.$axios({
                    url: commonUtil.serverUri(),
                    method: "post",
                    data: data
                }).then(function(response) {
                    // console.log(response.data);
                    if (response.data.status === "success") {
                        console.log(response.data.msg)
                    }
                });
            },function(err){
            })
        },
        createOrder:function(){ // 结算
            commonUtil.setCookie("_shouldPushHistory","true")
            let proList = []
            for(let i=0;i<this.selectProIds.length;i++){
                for(let j=0;j<this.cartsData.length;j++){
                    let item = this.cartsData[j]
                    if(item.id === this.selectProIds[i]){
                        let ele = {}
                        ele.type = item.type
                        ele.num = item.num
                        ele.price = item.price
                        ele.itemId = item.itemId
                        ele.userId = commonUtil.getCookie("_userId")
                        proList.push(ele)
                        break
                    }
                }
            }

			let data = {
				HEADER: {},
				PARAMS: {list: proList},
				SERVICE: "OrderService.creatOrder"
            }
			let _this = this
			_this.$axios({
				url: commonUtil.serverUri(),
				method: "post",
				data: data
			}).then(function(response) {
				_this.showComno = false
				console.log(response.data)
				if (response.data.status === "success") {
					commonUtil.setCookie("_serials",response.data.serials)
					_this.$router.push({name:"XMOrder",query:{serials:response.data.serials}})
				} else {
					alert(response.data.msg)
				}
			});
		},
        toLogin:function(){
            this.$router.push({name:"XMLogin",query:{type:"3"}})
        },
    },
    created:function(){
        window.postMessage("showCarts","*")
        this.queryCarts()
    } 
}
</script>


<style scoped>
/* ====================== */
.container{
    position: relative;
    padding: 0.5rem;
    background: white;
}
.cars_container{
    margin-bottom: 5.5rem;
}
.pro_cell{
    display: flex;
    position: relative;
    justify-content: left;
    align-items: center;
    padding:0  0.5rem;
    
}
.pro_cell:after{
    content: " ";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    border-bottom: solid 1px gray;
    transform: scaleY(0.5);
    -webkit-transform: scaleY(0.5);
    transform-origin: 0 0;
    -webkit-transform-origin: 0 0;
}

.pro_cell_checkbox{
    flex: 1;
}
.pro_cell_img{
    flex:3;
}
.pro_cell_msg{
    flex:12;
    text-align:left;
}
.pro_cell_msg>p,
.pro_cell_msg>div{
    margin: 0.2rem 0.5rem;
}
.pro_cell_title{
    font-size: .8rem;
}
.pro_cell_type{
    font-size: .6rem;
    padding: 0.3rem 0;
    padding-left: 0.5rem;
    background: #eeeeee;
    border-radius: 0.2rem;
}
.pro_cell_price{
    font-size: 1rem;
}
.pro_img{
    width:3rem;
    height:3rem;
}

.empty_tips{
}
.empty_tips_lab{
    font-size: .8rem;
    color: gray;
}
.empty_tips_img{
}
/* ====================== */
/* ====================== */
.ft_count_bar{
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 3rem;
    background: gray;
}

.ft_bar{
	bottom: 3rem;
}

.flex_tab_btn{
	flex:1;
	font-size: 0.5rem;

	display: flex;
	flex-direction: column;
	justify-content:center;
	align-items: center;

}
.flex_btn{
	flex:2;
    line-height: 3rem;
    height: 3rem;
    color: white;	
}
.total_price_lab{
    font-size: 1.4rem;
}

.cart_div{
	position: relative;
}
.back_icon,.check_box_select,.check_box_empty{
	width: 1rem;
	height: 1rem;
}
.pro_cell_checkbox .check_box_select,.pro_cell_checkbox .check_box_empty,.pro_cell_checkbox .pro_cell_del_btn{
    width: 1.5rem;
    height: 1.5rem;
}
/* ====================== */

</style>
