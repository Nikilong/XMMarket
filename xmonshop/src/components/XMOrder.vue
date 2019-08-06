<template>
    <div class="container">
        <!-- 提醒类 -->
        <confirm v-model="toastShow.showBack" content="返回将会丢失订单信息" @on-cancel="backConfirmCancel"  @on-confirm="backConfirmOK"></confirm>
        <confirm v-model="toastShow.showPay" content="您已经成功下单,点击确定去付款" @on-cancel="payConfirmCancel"  @on-confirm="payConfirmOK"></confirm>

        <!-- 主题内容 -->
        <group >
            <cell v-if="selectAddress.name" :title="selectAddress.name+' '+selectAddress.phone"  :inline-desc="selectAddress.area+' '+selectAddress.address" @click.native="openAddressList()" is-link></cell>
            <cell v-if="!selectAddress.name" title="请选择收货地址" @click.native="openAddressList" is-link></cell>
        </group>
        <group :title="'订单金额'+(productionData.length>1?(index+1):'')" v-for="item,index in productionData">
            <cell title="商品单价">￥{{item.price}}</cell>
            <cell title="数量">{{item.num}}</cell>
        </group>
        
        <!-- 底部tabbar -->
        <div class="ft_bar">
            <div class="tool_bar">
                <div class="flex_btn flex_btn_dec">应付金额<span class="p-money-sym c-red">￥<span class="p-money-num c-red">{{totalPrice}}</span></span></div>
                <div class="flex_btn bg-gray flex_btn_pay" @click="creatOrder">提交订单</div>
            </div>
        </div>
    </div>
</template>

<script>

import { Cell,Group,Confirm } from "vux"

export default {
    name:"xmorder",
    components:{
        Cell,Group,Confirm
    },
    computed:{
        totalPrice:function(){
            let totP = 0
            this.productionData.map(item=> totP+=item.price * item.num)
            return totP
        }
    },
    data(){
        return {
            selectAddress:{},  // 收件人信息
            productionData:[], // 商品信息
            toastShow:{
                showBack:false,
                showPay:false,
            }
        }
    },
    methods:{
        creatOrder(){
            let serials = this.$nkUtil.getCookie("_serials")
            let data = {
				HEADER: {},
				PARAMS: {serials:serials,address_id:this.selectAddress.id},
				SERVICE: "OrderService.archiveOrder"
            }
			let _this = this
			_this.$axios({
				url: _this.$nkUtil.serverUri(),
				method: "post",
				data: data
			}).then(function(response) {
				console.log(response.data)
				if (response.data.status === "success") {
                    _this.toastShow.showPay = true
				} else {
					this.$nkUtil.toast("warn",response.data.msg)
				}
			});
        },
        queryOrder(){
            let serials = this.$nkUtil.getCookie("_serials")
			let data = {
				HEADER: {},
				PARAMS: {serials:serials},
				SERVICE: "OrderService.queryOrder"
			}
			let _this = this
			_this.$axios({
				url: _this.$nkUtil.serverUri(),
				method: "post",
				data: data
			}).then(function(response) {
				console.log(response.data)
				if (response.data.status === "success") {
					_this.productionData = response.data.RESULT
				} else {
					this.$nkUtil.toast("warn",response.data.msg)
				}
			});
        },
        openAddressList(){
            this.$nkUtil.setCookie("_selectAddressOnly","false")
            this.$router.replace("addressList")
        },
        backConfirmCancel(){
            console.log("---pushHistory()")
            this.$nkUtil.pushHistory()
        },
        backConfirmOK(){
            window.history.back()

        },
        payConfirmCancel(){
        },
        payConfirmOK(){
            // todo
            console.log("跳转去付款")
        },
        goback(){  // 返回监听
            this.toastShow.showBack = true;
        },

    },
    created(){
        window.postMessage("hideTabbar","*")
        let params = this.$route.params
        if(params.name){
            this.selectAddress = params
        }
        // 查询订单
        this.queryOrder()
        // 是否应该pushhistroy
        if(this.$nkUtil.getCookie("_shouldPushHistory") === "true"){
            this.$nkUtil.setCookie("_shouldPushHistory","false")
            this.$nkUtil.pushHistory()
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

