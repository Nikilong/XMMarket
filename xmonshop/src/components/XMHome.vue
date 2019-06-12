<template>
  <div class="container" id="home_container">
	<div v-if="!showCarts">
		<div class="float_btns_view">
			<div class="float_icon">
				<div class="toTop_icon" @click="scorllToTop"></div>
			</div>
			<!-- <div class="float_icon">
				<div class="cart_float_icon" @click="showCartsPage"></div>
			</div> -->
		</div>
		<div v-for="item,index in shopList" class="list-item" data-type="0">
			<div class="list-box" @touchstart.capture="touchStart"  @touchend.capture="touchEnd" @click="openItem(item)">
				<img :src="item.pic" class="item-pic">
				<p v-text="item.itemName" class="title"></p>
				<p class="icon-list">
					<span class="coupon-amount-tag p-icon" v-if=" Number(item.couponAmount) > 0"><span class="coupon-amount-price">{{item.couponAmount}}</span></span>
					<span class="p-icon tmall-con" v-if="item.isTmall"></span>
					<span class="p-icon" :class="{'postfee-icon': Number(item.realPostFee) == 0}">{{ Number(item.realPostFee) > 0 ? item.realPostFee : "包邮" }}</span>
				</p>
				<p class="price-con">
					<span class="c-red p-icon">¥</span>
					<span class="c-red p-num">{{item.price < item.promotionPrice ? item.price : item.promotionPrice}}</span>
					<span class="r-price" v-if=" item.price != item.promotionPrice">¥{{item.price > item.promotionPrice ? item.price : item.promotionPrice}}</span>
				</p>
				<p class="other-info">
					<span class="fr">月销 {{item.monthSellCount}}</span>
				</p>
			</div>
			<!-- 删除按钮 -->
			<div class="delete_btn" @click="deleteItem" :data-index="index">删除</div>

		</div>
		<div style="text-align:center;">{{loadingMore.loading.status? loadingMore.loading.value : loadingMore.noMore.value}}</div>
	</div>
  </div>
</template>



<script>

import commonUtil from "../common/common"
import { Loading } from "vux"
import xmcarts from "./XMCarts"


export default {
  name: "xmhome",
  components: {
    Loading,xmcarts
	},
	props:[],
  data() {
    return {
		showCarts:false, // 购物车
		canEdit:false, // 能否编辑
		shopList:[ ],
		cartList:[],
		loadingMore:{
			show:false,
			loading:{
				status:false,
				value:"正在加载中...."
			},
			noMore:{
				status:false,
				value:"没有更多数据"
			}
		}, // 底部加载更多
		loadParams:{
			num:10,  // 每页条数
			pageNum:0,	// 页数
			totalNum:0, // 总数
		},
		startX: 0,
        endX: 0,
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
	openItem:function(item){
		console.log("open---item")
		window.onscroll = null
		this.$router.push({path:"/detail",query:{itemId:item.itemId}})
		// this.$router.push({name:"XMDetail",params:item})
	},
	scorllToTop:function(){
		//平顺滚动动画
		const currentY = document.documentElement.scrollTop || document.body.scrollTop;
		commonUtil.scrollAnimation(currentY,0);
	},
	showCartsPage:function(){
		// this.showCarts = !this.showCarts
		this.$router.push("carts")
	},
	queryList:function(){
		// 获取商品清单
		let data = {
			HEADER: {},
			PARAMS: {num:this.loadParams.num, pageNum:this.loadParams.pageNum},
			SERVICE: "ShopService.queryProductions"
		};
		let _this = this;
		this.$axios({
			url: commonUtil.serverUri(),
			method: "post",
			data: data
		}).then(function(response) {
			// 恢复加载标志
			_this.loadingMore.show = false
			console.log(response.data);
			if (response.data.status === "success") {
				if(_this.loadParams.pageNum === 0){
					_this.shopList = Array.from(response.data.list)
				}else{
					_this.shopList = _this.shopList.concat(response.data.list)
				}
				// 没有更多数据
				if(_this.shopList.length === response.data.totalNum){
						_this.loadingMore.loading.status = false;
						_this.loadingMore.noMore.status = true;
				}
			} else {
				alert("无数据")
			}
		});
	},
	//滑动开始
	touchStart(e) {
		if(this.canEdit === false) return
		// 记录初始位置
		this.startX = e.touches[0].clientX;
	},
	//滑动进行中
	touchMove(e) {
		if(this.canEdit === false) return
		// console.log("move")
	},
	//滑动结束
	touchEnd(e) {
		if(this.canEdit === false) return
		// 当前滑动的父级元素
		let parentElement = e.currentTarget.parentElement;
		// 记录结束位置
		this.endX = e.changedTouches[0].clientX;
		// 左滑
		if (parentElement.dataset.type == 0 && this.startX - this.endX > 30) {
				this.restSlide();
				parentElement.dataset.type = 1;
		}
		// 右滑
		if (parentElement.dataset.type == 1 && this.startX - this.endX < -30) {
				this.restSlide();
				parentElement.dataset.type = 0;
		}
		this.startX = 0;
		this.endX = 0;
	},
	//判断当前是否有滑块处于滑动状态
	checkSlide() {
		let listItems = document.querySelectorAll('.list-item');
		for (let i = 0; i < listItems.length; i++) {
				if (listItems[i].dataset.type == 1) {
						return true;
				}
		}
		return false;
	},
	//复位滑动状态
	restSlide() {
		let listItems = document.querySelectorAll('.list-item');
		// 复位
		for (let i = 0; i < listItems.length; i++) {
				listItems[i].dataset.type = 0;
		}
	},
	//删除
	deleteItem(e) {
		console.log(e)
		console.log("刪除")
		// 当前索引
		let index = e.currentTarget.dataset.index;
		// 复位
		this.restSlide();
		// 删除
		let data = {
				HEADER: {},
				PARAMS: {id:this.shopList[index].itemId},
				SERVICE: "ShopService.deleteProductionById"
			};
		let _this = this;
		this.$axios({
				url: commonUtil.serverUri(),
				method: "post",
				data: data
			}).then(function(response) {
				console.log(response.data);
				if (response.data.status === "success") {
					_this.shopList.splice(index, 1);
				} else {
					alert("删除失败")
				}
			});
	},
	// 滚动监听
	chargeScroll(){
		let _this = this
		// 没有更多数据的时候不再监听滚动
		if(_this.loadingMore.noMore.status === true) return
		window.requestAnimationFrame(function()
		{
			let bottomDis = document.documentElement.offsetHeight - document.documentElement.scrollTop - window.innerHeight;
			if(bottomDis < 100 && _this.loadingMore.show === false){
				console.log("---")
				_this.loadingMore.show = true;
				_this.loadingMore.loading.status = true;
				_this.loadParams.pageNum += 1;
				_this.queryList();
			}
		});
	},

  },
  created: function() {
		window.postMessage("showHome","*")
		// 判断是否有编辑
		let _this = this
		this.avalidToken(function(data){
			console.log(data)
			if(data.editRight > 7){
				_this.canEdit = true
			}
		})

		// 初始化第一页数据
		this.loadParams.pageNum = 0
		this.loadParams.num = 10
		this.queryList()

		// 监听滚动
		window.addEventListener("scroll",this.chargeScroll,false)
		
  },
  destroyed:function(){
	  window.removeEventListener("scroll",this.chargeScroll,false)
  },
};
</script>

<style scoped>
@import '../common/commonStyle';
.container{
	margin-top: 1rem;
	margin-bottom: 4rem;
	overflow-x: hidden;
}

.float_btns_view{
	position: fixed;
	bottom: 4rem;
	right: 1rem;
	width: 3rem;
	z-index:999;
}

.float_icon{
	/* opacity: 0.7; */
	/* background: gray; */
	border-radius: 1.5rem;
}
.float_icon div{
	width: 3rem;
	height: 3rem;
}

.float_icon_cart{
	width: 2rem;
	height: 2rem;
}


 .list-item{
    position: relative;
    height:7rem;
		width: 100%;
		-webkit-transition: all 0.2s;
		transition: all 0.2s;
}
 .list-item:after{
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
 .list-item .title{
     font-size: 0.8rem;
 }
 .list-item p{
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-align: left;
    padding-left: 7rem;
    margin: 0;
}
.item-pic{
    position: absolute;
    left: .5rem;
    top: .5rem;
    height: 6rem;
    width: 6rem;
    max-width: 100%;
    vertical-align: top;
}
.p-icon,.r-price{
    font-size: 0.6rem;
    line-height: 0.6rem;
}
.tmall-con{
    display: inline-block;
    width: .6rem;
    height: .6rem;
    background: url(https://gw.alicdn.com/tps/TB10U2vKFXXXXa3XXXXXXXXXXXX-36-36.png);
    background-size: cover;
}
.coupon-amount-tag{
	  display: inline-block;
    background: url(http://gw.alicdn.com/tps/TB14Vh.OXXXXXXxXVXXXXXXXXXX-34-32.png) no-repeat;
    background-size: 17px 16px;
    height: 16px;
    padding-left: 16px;
    margin-left: .16rem;
}

.coupon-amount-price{
	border: 1px solid #fe4800;
    border-left: none;
    line-height: 14px;
    height: 14px;
    overflow: hidden;
    display: block;
    padding: 0 2px;
    color: #fe4800;
    margin-bottom: -3px;
    font-size: 12px;
}

.postfee-icon{
    background: #55ae95;
    border-radius: 0.2rem;
    color: white;
    padding: 0 0.2rem;
    font-weight: 800;
}
.r-price{
    color: #d4d4d4;
    text-decoration: line-through;
}
.p-num{
    font-weight: 700;
    line-height: 2rem;
}
.list-item .other-info{
    position: absolute;
    bottom: 0.2rem;
    left: 0;
    right: 0.5rem;
    font-size: 0.6rem;
		text-align: right;
}

.other-info .fr{
		/* float:right; */
}

/* 侧滑----start */
.list-item[data-type="0"] {
		transform: translate3d(0, 0, 0);
}

.list-item[data-type="1"] {
		transform: translate3d(-80px, 0, 0);
}
.list-item .delete_btn {
		width: 5rem;
		height: 100%;
		background: #ff4949;
		font-size: 19px;
		color: #fff;
		text-align: center;
		line-height: 7rem;
		position: absolute;
		top: 0;
		right: -5rem;
}
/* 侧滑----end */
</style>

