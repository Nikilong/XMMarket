<template>
    <div class="container">
        <!-- 提醒类 -->
        <confirm v-model="toastShow.showBack" title="温馨提示" content="返回将会丢失订单信息" @on-cancel="backConfirmCancel"  @on-confirm="backConfirmOK"></confirm>

        <!-- 主题内容 -->
        <group >
            <cell v-if="selectAddress.name" :title="selectAddress.name+' '+selectAddress.phone"  :inline-desc="selectAddress.area+' '+selectAddress.address" @click.native="openAddressList()" is-link></cell>
            <cell v-if="!selectAddress.name" title="请选择收货地址" @click.native="openAddressList" is-link></cell>
        </group>
        <group title="订单金额">
            <cell title="商品单价">￥{{productionData.price}}</cell>
            <cell title="数量">{{productionData.num}}</cell>
        </group>
        
        <!-- 底部tabbar -->
        <div class="ft_bar">
            <div class="tool_bar">
                <div class="flex_btn flex_btn_dec">应付金额<span class="p-money-sym c-red">￥<span class="p-money-num c-red">{{productionData.price * productionData.num}}</span></span></div>
                <div class="flex_btn bg-gray flex_btn_pay" @click="creatOrder">提交订单</div>
            </div>
        </div>
    </div>
</template>

<script>

import commonUtil from "../common/common"
import { Cell,Group,Confirm } from "vux"

export default {
    name:"xmorder",
    components:{
        Cell,Group,Confirm
    },
    data(){
        return {
            selectAddress:{},  // 收件人信息
            productionData:{}, // 商品信息
            toastShow:{
                showBack:false,
            }
        }
    },
    methods:{
        creatOrder(){
            console.log("生产订单-----")
        },
        queryOrder(){
            let serials = commonUtil.getCookie("_serials")
			let data = {
				HEADER: {},
				PARAMS: {serials:serials},
				SERVICE: "OrderService.queryOrder"
			}
			let _this = this
			_this.$axios({
				url: commonUtil.serverUri(),
				method: "post",
				data: data
			}).then(function(response) {
				console.log(response.data)
				if (response.data.status === "success") {
					_this.productionData = response.data.RESULT[0]
				} else {
					alert(response.data.msg)
				}
			});
        },
        openAddressList(){
            this.$router.replace("addressList")
        },
        backConfirmCancel(){
            console.log("commonUtil.pushHistory()")
            commonUtil.pushHistory()
        },
        backConfirmOK(){
            window.history.back()

        },
        goback(){  // 返回监听
            this.toastShow.showBack = true;
        },

    },
    created(){
        let params = this.$route.params
        if(params.name){
            this.selectAddress = params
        }
        // 查询订单
        this.queryOrder()
        // 是否应该pushhistroy
        if(commonUtil.getCookie("_shouldPushHistory") === "true"){
            commonUtil.setCookie("_shouldPushHistory","false")
            commonUtil.pushHistory()
        }
        // 监听返回
        window.addEventListener("popstate",this.goback,false)
    },
    destroyed(){
        window.removeEventListener("popstate",this.goback,false)
    }
}
</script>

<style scoped>
@import '../common/commonStyle';
.container{
    text-align: left;
}
.weui-cell p{
    margin:0 !important;
}

.p-money-sym{
    font-size: 0.3rem;
}

.p-money-num{
    font-size: 1.4rem;
    line-height: 1.4rem;
}

.flex_btn{
    height: 3rem;
    line-height: 3rem;
}
.flex_btn_dec{
    flex: 9;
    padding-left: 1rem;
}

.flex_btn_pay{
    flex: 3;
    text-align: center;
    color: white;
}
</style>

