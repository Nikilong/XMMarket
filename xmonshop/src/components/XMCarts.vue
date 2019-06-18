<template>
    <!-- <div class="container" :class="{'animate_pullDown':hideCarts,'animate_pullUp':!hideCarts}"> -->
    <div class="container">
        <div class="cars_container">
            <div class="pro_cell" v-if="cartsData.length>0" v-for="item,daIndex in cartsData">
                <div class="pro_cell_checkbox">
                    <div @click="changeCheckbox(daIndex,item.itemId,item.num)" class="check_box_empty" :class="{'check_box_select':selectProIndexs.indexOf(daIndex) >= 0}"></div>
                </div>
                <div class="pro_cell_img">
                    <img class="pro_img" :src="item.pic">
                </div>
                <div class="pro_cell_msg">
                    <p class="pro_cell_title">{{item.itemName}}</p>
                    <p class="pro_cell_type">{{item.type}}</p>
                    <p class="pro_cell_price c_red">￥{{item.price}}</p>
                    <div style="position: relative;">
                        <x-number style="position: absolute;right:-2rem;bottom:-.5rem;transform:scale(0.7);" align="right"  button-style="square" :min="1" :max="99" v-model="item.num"></x-number>
                    </div>
                </div>
                <div class="pro_cell_checkbox">
                    <div @click="deleteProAtIndex(daIndex)" class="pro_cell_del_btn"></div>
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
                <div class="flex_tab_btn" @click="selectOrUnselectAll"><span class="check_box_empty" :class="{'check_box_select':selectProIndexs.length===cartsData.length&&cartsData.length>0}"></span><span class="c-gray">全选</span></div>
                <!-- <div class="flex_tab_btn" @click="calltoBack"><span class="back_icon"></span><span>返回</span></div> -->
                <div class="flex_btn" style="color: black;"><span v-if="selectProIndexs.length > 0">合计:<span class="c_red total_price_lab">￥{{totalPrice}}</span></span></div>
                <div class="flex_btn" :class="{'bg-darkgray':selectProIndexs.length>0,'bg-lightgray':selectProIndexs.length===0}">结算<span v-if="selectProIndexs.length > 0">({{selectProIndexs.length}})</span></div>
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
            for(let i=0;i<this.selectProIndexs.length;i++){
                let ele = this.cartsData[this.selectProIndexs[i]]
                totalP += ele.num * ele.price
            }
            return totalP;
        }

    },
    data(){
        return {
            cartsData:[], // 商品数据
            selectProIndexs:[],  // 勾选商品id
            selectProData:[],  // 勾选商品数据
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
                    } else {
                        alert(response.data.msg)
                    }
                });
            },function(err){
                _this.showLoginTips = true
            })
        },
        selectOrUnselectAll:function(){
            // console.log(this.selectProIndexs.length +"----"+ this.cartsData.length)
            if(this.selectProIndexs.length === this.cartsData.length){
                this.selectProIndexs = []
                this.selectProData = []
            }else{
                this.selectProIndexs = []
                for(let i=0;i<this.cartsData.length;i++){
                    this.selectProIndexs.push(i)
                    let ele = this.cartsData[i]
                    this.selectProData.push({id:ele.itemId,num:ele.num})
                }
            }
           
        },
        changeCheckbox:function(daIndex,id,num){
            let index = this.selectProIndexs.indexOf(daIndex)
            if(index >= 0){
                this.selectProIndexs.splice(index,1)
                this.selectProData.splice(index,1)
            }else{
                let ele = {id:id,num:num}
                this.selectProIndexs.push(daIndex)
                this.selectProData.push(ele)
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
            console.log(item)
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
    justify-content: left;
    align-items: center;
    border-bottom: 1px solid gray;
    padding:0  0.5rem;
    
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
	position: fixed;
	bottom: 3rem;
	width:100%;
	background: white;
}
.tool_bar{
	display: flex;
	justify-content:center;
	align-items: center;
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
