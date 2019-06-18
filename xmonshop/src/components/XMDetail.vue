<template>
  <div class="container" style="background:#f6f6f6;">
		<!-- 提醒类 -->
		<confirm v-model="showLoginConfirm" content="需要登录才能进行该操作,是否前往登录?" @on-confirm="toLoginPage"></confirm>

		<!-- 主体 -->
		<div v-if="!showCarts">
			<popup v-model="showComno" position="bottom" max-height="60%" style="background:white;">
				<div class="popup_content">
					<p class="total_price_lab">共计:￥{{totalPrice}}</p>
					<div class="combo_cell" v-for="item,groIndex in combo">
						<p v-text="item.name" class="combo_title"></p>
						<div class="combo_check_div">
							<!-- <span class="combo_checkbox" :class="{combo_checkbox_select:index===item.selectIndex}"  v-text="ele.type" v-for="ele,index in item.values" @click="selectComboCheck(groIndex,index,ele.price)"></span> -->
							<span class="combo_checkbox" :class="{combo_checkbox_select:index===item.selectIndex}"  v-text="ele.type" v-for="ele,index in item.values" @click="selectComboCheck(groIndex,index,ele.price)"></span>
						</div>

					</div>
					<div class="combo_cell_num">
							<x-number title="购买数量" align="right"  button-style="square" :min="1" :max="99" v-model="proNum" :fillable="true"></x-number>
					</div>
				</div>
				<div class="xm_btn" @click="comboDidClick">确定</div>
			</popup>
				
			<div class="detail_photo_div">
				<img :src="itemData.pic">
			</div>
			<div class="detail_content">
				<p class="price-con">
						<span class="c-red p-icon">¥</span>
						<span class="c-red p-num">{{itemData.price < itemData.promotionPrice ? itemData.price : itemData.promotionPrice}}</span>
						<span class="r-price" v-if=" itemData.price != itemData.promotionPrice">¥{{itemData.price > itemData.promotionPrice ? itemData.price : itemData.promotionPrice}}</span>
				</p>
				<p>{{itemData.itemName}}</p>
			</div>
			<div class="detail_desc">
				<p>{{itemData.subTitle}}</p>
			</div>
			<div class="detail_photo_div" v-if="detailImgs.length > 0" style="margin-bottom:3rem;">
				<img :src="url" v-for="url in detailImgs"> 
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

import commonUtil from "../common/common";
import { Loading,Popup,Checker, CheckerItem,XNumber,Confirm } from "vux";
import xmcarts from "./XMCarts"


export default {
  name: "xmdetail",
  components: {
    xmcarts,Loading,Popup,Checker, CheckerItem,XNumber,Confirm
	},
	props:[],
	computed:{
		detailImgs:function(){
			console.log(this.itemData.smallImage)
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
		totalPrice:function(){
			let totalP = 0;
			for(let i=0;i<this.combo.length;i++){
				let selectData = this.combo[i];
				totalP += selectData.values[selectData.selectIndex].price
			}
			totalP = totalP * this.proNum
			return totalP;
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
			this.avalidToken(function(data){
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
		getProductionById:function(id)
		{ // 查询商品详情
			let data = {
					HEADER: {},
					PARAMS: {id:Number(id)},
					SERVICE: "ShopService.getProductionById"
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
						_this.itemData = response.data.RESULT[0];
						try{
							let jsonStr =_this.itemData.combo
							_this.combo = JSON.parse(jsonStr).RESULT
						}catch(e){
							console.log(e)
						}
					} else {
						alert(response.data.msg)
					}
			})
		},
		updateCart:function() // 更新购物车数量
		{
			let data = {
				HEADER: {},
				PARAMS: {id:commonUtil.getCookie("_userId")},
				SERVICE: "ShopService.queryCart"
			};
			let _this = this;
			this.$axios({
				url: commonUtil.serverUri(),
				method: "post",
				data: data
			}).then(function(response) {
				console.log(response.data);
				if (response.data.status === "success") {
					_this.cartList = Array.from(response.data.cartList)
				} else {
					alert(response.data.msg)
				}
			});
		},
		updateCombo:function(data){
			this.combo = data
		},
		selectComboCheck:function(groIndex,index,price){
			// console.log(groIndex+"---"+index+"----"+price)
			this.combo[groIndex].selectIndex = index;
		},
		showComnoPopup:function(isCreateOrder){
			console.log(isCreateOrder)
			let _this = this
			this.avalidToken(function(data){
				_this.showComno=true
				_this.isCreateOrder = isCreateOrder ? true : false
			},function(err){
				_this.showLoginConfirm = true
			})
		},
		comboDidClick:function(){ 
			if(this.isCreateOrder){
				this.createOrder()
			}else{
				this.addToCart()
			}
		},
		createOrder:function(){ // 立即购买
			commonUtil.setCookie("_shouldPushHistory","true")
			let params = {};

			let typeStr = "";
			for(let i=0;i<this.combo.length;i++){
				let selectData = this.combo[i];
				typeStr = typeStr+"-"+selectData.values[selectData.selectIndex].type
			}
			params.type = typeStr.substring(1);
			params.num = this.proNum
			params.price = this.totalPrice / this.proNum;
			params.itemId = this.itemData.itemId
			params.userId = commonUtil.getCookie("_userId")

			let data = {
				HEADER: {},
				PARAMS: params,
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
		toLoginPage:function(){
			this.$router.push({path:"/login",query:{type:"1",itemId:this.itemData.itemId}})
		},
		addToCart:function()
		{
			console.log(this.combo)
			let params = {};

			let typeStr = "";
			for(let i=0;i<this.combo.length;i++){
				let selectData = this.combo[i];
				typeStr = typeStr+"-"+selectData.values[selectData.selectIndex].type
			}
			params.type = typeStr.substring(1);
			params.num = this.proNum
			params.price = this.totalPrice / this.proNum;
			params.pic = this.itemData.pic
			params.itemId = this.itemData.itemId
			params.itemName = this.itemData.itemName
			params.userId = commonUtil.getCookie("_userId")

			let data = {
				HEADER: {},
				PARAMS: params,
				SERVICE: "ShopService.addToCart"
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
					_this.cartList = Array.from(response.data.cartList);
				} else {
					alert(response.data.msg)
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
		let itemId = commonUtil.getQueryString("itemId")
		if(itemId){  // 查询商品详情
			this.getProductionById(itemId)
			let _this = this
			this.avalidToken(function(data){
				_this.updateCart()
			})
		}else{
			alert("无效的url")
		}
  }
};
</script>

<style scoped>
.container,p,div{
	margin: 0;
	padding: 0;
}
.c-red{
	color:red;
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
	height: 6rem;
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
/*===========*/
/* 型号弹框 */
.total_price_lab{
	color: red;
	font-size: 1rem;
	padding: 0.5rem;
	text-align: left;
}
.combo_cell{
	height: 5rem;
}
.combo_cell_num{
	padding: 0.5rem;
}
.combo_title{
	text-align: left;
	padding: 0.5rem;
}
.combo_check_div{
	display: flex;
}
.combo_checkbox{
	padding:0.5rem  0.8rem;
	margin:0 0.5rem;
	background:#F5F5F5;
	border-radius: 0.2rem;
}
.combo_checkbox_select{
	/* border: 1px solid black; */
	/* background: #4D3126; */
	background: darkgray;
	color: white;
}

.popup_content{
	margin-bottom: 3rem;
}
.xm_btn{
	position: fixed;;
	bottom: 0;
	width:100%;
	height: 3rem;
	/* background: #4D3126; */
	background: darkgray;
	line-height: 3rem;
	font-size: 1.2rem;
	color: white;
}
/*===========*/

</style>

