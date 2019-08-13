<template>
  <div class="container" style="background:#f6f6f6;">
		<!-- 提醒类 -->
		<confirm v-model="showLoginConfirm" content="需要登录才能进行该操作,是否前往登录?" @on-confirm="toLoginPage"></confirm>

		<!-- 主体 -->
		<div v-if="!showCarts">

			<xmcombo ref="combo" :combo="combo" @comboDidClick="selectCombo"></xmcombo>
				
			<div class="detail_photo_div">
				<img :src="itemData.pic">
			</div>
			<div class="detail_content">
				<p class="price-con">
					<span class="c-red p-icon">¥</span>
					<span class="c-red p-num">{{(itemData.price < itemData.promotionPrice)?itemData.price:itemData.promotionPrice}}</span>
					<span class="r-price" v-if="itemData.price!=itemData.promotionPrice">¥{{(itemData.price > itemData.promotionPrice)?itemData.price:itemData.promotionPrice}}</span>
				</p>
				<p>{{itemData.itemName}}</p>
			</div>
			<div v-if="itemData.subTitle" class="detail_desc">
				<p>{{itemData.subTitle}}</p>
			</div>
			<div class="detail_photo_div" v-if="detailImgs.length > 0" style="margin-bottom:3rem;">
				<img :src="url" v-for="url in detailImgs" :key="url"> 
			</div>

			<div class="ft_bar">
				<div class="tool_bar">
					<div class="flex_tab_btn"><span class="home_icon"></span><span class="c-gray" @click="backToShop">首页</span></div>
					<div class="flex_tab_btn cart_div" @click="showCartsPage"><span class="cart_icon"></span><span class="c-gray">购物车</span><span class="cart_badge" v-if="cartList.length > 0">{{cartList.length>99?'99+':cartList.length}}</span></div>
					<div class="flex_btn bg-gray" @click="showComnoPopup(false)">加入购物车</div>
					<div class="flex_btn bg-darkgray" @click="showComnoPopup(true)">立即购买</div>
				</div>
			</div>

		</div>
  </div>
</template>



<script>

import { Loading,Confirm } from "vux";
import xmcarts from "./XMCarts"
import xmcombo from "./XMCombo"


export default {
  name: "xmdetail",
  components: {
    xmcarts,xmcombo,Loading,Confirm
	},
	props:[],
	computed:{
		detailImgs:function(){
			if(this.itemData.smallImage === "" || !this.itemData.smallImage) return [];
			let spraStr = "|&&|"
			try{
				if(this.itemData.smallImage.indexOf(spraStr)>-1){
					let imgs = this.itemData.smallImage.split("|&&|");
					return imgs;
				}else{
					return []; 
				}
			}catch(e){
				console.log(e)
				return []
			}
		},
	},
  data() {
    return {
			itemData:{}, // 商品数据
			cartList:[],
			combo:[],  // 型号数据
			proNum:1,		// 购买数目
			showComno:false,  // 显示套餐
			showCarts:false, // 购物车页面
			showLoginConfirm:false, //前往登录confirm
    }
  },
  methods: {
		showCartsPage:function(e){
			let _this = this
			this.$nkUtil.avalidToken(function(data){
				_this.showCarts = !_this.showCarts
				_this.$router.push("carts")
				window.postMessage("showCarts","*")
			},function(err){
				_this.showLoginConfirm = true
			})
		},
		backToShop:function(){
			this.$router.push("home")
		},
		getProductionById:function(id)
		{ // 查询商品详情
			let data = {
				HEADER: {},
				PARAMS: {id:Number(id)},
				SERVICE: "ShopService.getProductionById"
			}

			let _this = this;
			this.$axios({
				url: _this.$nkUtil.serverUri(),
				method: "post",
				data: data
			})
			.then(function(response){
					console.log(response.data)
					if (response.data.status === "success") {
						_this.itemData = response.data.RESULT[0];
						try{
							let jsonStr =_this.itemData.combo
							_this.combo = JSON.parse(jsonStr).RESULT
						}catch(e){
							console.log(e)
						}
					} else {
						this.$nkUtil.toast("warn",response.data.msg)
					}
			})
		},
		updateCart:function() // 更新购物车数量
		{
			let data = {
				HEADER: {},
				PARAMS: {id:this.$nkUtil.getCookie("_userId")},
				SERVICE: "ShopService.queryCart"
			};
			let _this = this;
			this.$axios({
				url: _this.$nkUtil.serverUri(),
				method: "post",
				data: data
			}).then(function(response) {
				console.log(response.data);
				if (response.data.status === "success") {
					_this.cartList = Array.from(response.data.cartList)
				} else {
					this.$nkUtil.toast("warn",response.data.msg)
				}
			});
		},
		showComnoPopup:function(isCreateOrder){
			let _this = this
			this.$nkUtil.avalidToken(function(data){
				_this.$refs.combo.show(true)
				_this.isCreateOrder = isCreateOrder ? true : false
			},function(err){
				_this.showLoginConfirm = true
			})
		},
		selectCombo:function(typeStr,num,perPri){ 
			if(this.isCreateOrder){
				this.createOrder(typeStr,num,perPri)
			}else{
				this.addToCart(typeStr,num,perPri)
			}
		},
		createOrder:function(typeStr,num,perPri){ // 立即购买
			this.$nkUtil.setCookie("_shouldPushHistory","true")
			let proList = {};

			proList.type = typeStr
			proList.num = num
			proList.price = perPri
			proList.itemId = this.itemData.itemId
			proList.userId = this.$nkUtil.getCookie("_userId")

			let data = {
				HEADER: {},
				PARAMS: {list:[proList]},
				SERVICE: "OrderService.creatOrder"
			}
			let _this = this
			_this.$axios({
				url: _this.$nkUtil.serverUri(),
				method: "post",
				data: data
			}).then(function(response) {
				_this.showComno = false
				console.log(response.data)
				if (response.data.status === "success") {
					_this.$nkUtil.setCookie("_serials",response.data.serials)
					_this.$router.push({name:"XMOrder",query:{serials:response.data.serials}})
				} else {
					this.$nkUtil.toast("warn",response.data.msg)
				}
			});
		},
		toLoginPage:function(){
			this.$router.push({path:"/login",query:{type:"1",itemId:this.itemData.itemId}})
		},
		addToCart:function(typeStr,num,perPri)
		{
			let params = {};

			params.pic = this.itemData.pic
			params.itemId = this.itemData.itemId
			params.type = typeStr
			params.num = num
			params.price = perPri
			params.itemName = this.itemData.itemName
			params.userId = this.$nkUtil.getCookie("_userId")

			let data = {
				HEADER: {},
				PARAMS: params,
				SERVICE: "ShopService.addToCart"
			}
			let _this = this
			_this.$axios({
				url: _this.$nkUtil.serverUri(),
				method: "post",
				data: data
			}).then(function(response) {
				_this.showComno = false
				console.log(response.data)
				if (response.data.status === "success") {
					_this.cartList = Array.from(response.data.cartList);
					window.postMessage("updataCartsCount--"+_this.cartList.length,"*")
				} else {
					this.$nkUtil.toast("warn",response.data.msg)
				}
			});
		},
		stopBodyScroll:function (isFixed) 
		{
			if (isFixed) {
				document.body.style.position = 'fixed'
				this.top = window.scrollY //并没有起到作用，但是最好是加上当
				document.body.style.top = -this.top + 'px' //同上
			} else {
				document.body.style.position = ''
				document.body.style.top = '' //并没有起到作用，但是最好是加上当
				window.scrollTo(0, this.top) //同上
			}
		}
		
	},
	watch:{
		showComno: {
			deep: true,
			handler: function (newV, oldV) {
				this.stopBodyScroll(newV)
			}
		},
	},
	created: function() 
	{
		window.postMessage("hideTabbar","*")
		console.log("----deatal____creat")
		let itemId = this.$nkUtil.getQueryString("itemId")
		if(itemId){  // 查询商品详情
			this.getProductionById(itemId)
			let _this = this
			this.$nkUtil.avalidToken(function(data){
				_this.updateCart()
			})
		}else{
			this.$nkUtil.toast("warn","无效的url")
		}
  }
};
</script>

<style scoped>
.container,p,div{
	margin: 0;
	padding: 0;
}
.detail_content{
	padding: 0.5rem .5rem;
}
.p-num{
    font-weight: 700;
    line-height: 2rem;
    font-size: 1.7rem;
}
.r-price{
    color: #d4d4d4;
    text-decoration: line-through;
		padding-left: 0.5rem;
}
.p-icon,.r-price{
    font-size: 1.2rem;
    line-height: 1.2rem;
}


.detail_photo_div img{
	width: 100%;
	height: 100vw;
}

.detail_content{
	text-align: left;
	background:white;
}

.detail_desc{
	position: relative;
	margin: 0.5rem 0;
	background:white;
	max-height: 6rem;
}

.detail_desc p{
	padding: 0.5rem;
	text-align: left;
}

.flex_tab_btn {
    flex: 1;
    font-size: 0.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.flex_btn {
    flex: 2;
    line-height: 3rem;
    color: white;
}

.cart_div{
	position: relative;
}
.cart_badge{
	position: absolute;
	right: 0.5rem;
	top: -0.5rem;
	background: red;
	border-radius: 0.6rem;
	width: 1.2rem;
	height: 1.2rem;
	color: white;
	font-size: 0.8rem;
	line-height: 1.2rem;
	font-weight: 700;
}
.cart_icon,.home_icon{
	width: 1rem;
	height: 1rem;
}

</style>

