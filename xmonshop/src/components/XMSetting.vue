<template>
  	<div class="container">

		<!-- 提醒类 -->
		<confirm v-model="showTodoConfirm" content="该功能尚在开发阶段,敬请期待"></confirm>

		<group >
		<cell :title="userName" inline-desc="已绑定微信">
			<img slot="icon" width="50" style="display:block;margin-right:5px;" src="../assets/icons/avartar_icon.svg">
			<button class="logout_btn c-red"  @click="logout">{{userName===""?"登录":"注销"}}</button>
		</cell>
		</group>

		<div class="version_div bg-gray">
			<span class="welcome_tip">亲，欢迎光临XMShop!</span>
			<span class="version_tip">版本1.0.0</span>
		</div>
		<group>
			<cell title="我的订单" link="/orderTab?tabIndex=0"  is-link>查看全部订单</cell>
			<grid :show-lr-borders="false" :show-vertical-dividers="false">
				<grid-item link="/orderTab?tabIndex=1" label="待付款">
					<img slot="icon" src="../assets/setting/setting-daifukuan.svg">
				</grid-item>
				<grid-item link="/orderTab?tabIndex=2" label="待发货">
					<img slot="icon" src="../assets/setting/setting-daifahuo.svg">
				</grid-item>
				<grid-item link="/orderTab?tabIndex=3" label="待收货">
					<img slot="icon" src="../assets/setting/setting-daishouhuo.svg">
				</grid-item>
				<grid-item link="/orderTab?tabIndex=4" label="待评价">
					<img slot="icon" src="../assets/setting/setting-daipinjia.svg">
				</grid-item>
				<grid-item link="/orderTab?tabIndex=5" label="退货/退款">
					<img slot="icon" src="../assets/setting/setting-shouhou.svg">
				</grid-item>
			</grid>
		</group>   

		<group>
			<cell title="我的服务"></cell>
			<grid :show-lr-borders="false" :show-vertical-dividers="false">
				<div @click="showTodoTips">
					<grid-item label="优惠券">
						<img slot="icon" src="../assets/setting/setting-ser-yhj.svg">
					</grid-item>
					<grid-item label="收藏">
						<img slot="icon" src="../assets/setting/setting-ser-sc.svg">
					</grid-item>
					<grid-item label="到货提醒">
						<img slot="icon" src="../assets/setting/setting-ser-dhtx.svg">
					</grid-item>
				</div>
				<grid-item link="/addressList?selectAddressOnly=true" label="地址">
					<img slot="icon" src="../assets/setting/setting-ser-dz.svg">
				</grid-item>
			</grid>
			<grid :show-lr-borders="false" :show-vertical-dividers="false">
				<div @click="showTodoTips">
					<grid-item label="品牌日志">
						<img slot="icon" src="../assets/setting/setting-ser-pprz.svg">
					</grid-item>
					<grid-item label="客服信息">
						<img slot="icon" src="../assets/setting/setting-ser-kf.svg">
					</grid-item>
					<grid-item label="系统反馈">
						<img slot="icon" src="../assets/setting/setting-ser-xtfk.svg">
					</grid-item>
					<grid-item label="服务条款">
						<img slot="icon" src="../assets/setting/setting-ser-fwtk.svg">
					</grid-item>
				</div>
			</grid>
		</group>   

		<group>
			<cell title="商家功能"></cell>
			<grid :show-lr-borders="false" :show-vertical-dividers="false">
				<div @click="showTodoTips()">
					<grid-item label="增加商品" >
						<img slot="icon" src="../assets/setting/setting-shop-add.svg">
					</grid-item>
					<grid-item label="修改商品">
						<img slot="icon" src="../assets/setting/setting-shop-edit.svg">
					</grid-item>
					<grid-item label="处理退款">
						<img slot="icon" src="../assets/setting/setting-shop-th.svg">
					</grid-item>
					<grid-item label="查看订单">
						<img slot="icon" src="../assets/setting/setting-shop-dk.svg">
					</grid-item>
				</div>
			</grid>
		</group>   

  	</div>
</template>



<script>

import { Loading,Cell,Group,Grid, GridItem,Confirm } from "vux"


export default {
	name: "xmboss",
	components: {
		Loading,Cell,Group,Grid, GridItem,Confirm
		},
	props:[],
	data() {
		return {
		userName:"",  // 登录用户名
		showTodoConfirm:false, // 提示正在开放中
		}
	},
	computed: {},
	methods: {
		showTodoTips:function(index){
			this.showTodoConfirm = true
		},
		logout: function() 
		{
		this.$nkUtil.setCookie("_accesstoken", "");
		this.$nkUtil.setCookie("_account", "");
		this.$nkUtil.setCookie("_userName", "");
			// this.$emit("logoutEvent", { status: "success", msg: "注销成功!!!" });
			this.$router.push("login")
		},
	},
	created: function() {
		window.postMessage("showSetting","*")
		
		let _this = this
		this.$nkUtil.avalidToken(function(data){
			// 检测用户是否登录
			_this.userName = _this.$nkUtil.getCookie("_userName") || ""
			_this.canEdit = data.editRight> 5 ? true : false
		},function(err){
			_this.userName = ""
		})
	},
};
</script>

<style  scoped>
.container{
	margin-bottom: 3rem;
}

.logout_btn {
  text-decoration: red;
  border: 1px solid gray;
  border-radius: 0.5rem;
  padding: 0.2rem 0.8rem;
  background: transparent;
}

.version_div{
	height: 1rem;
	font-size: .5rem;
	color: white;
	text-align: left;
	padding-left: 1rem;
}
.welcome_tip{

}
.version_tip{
	float: right;
	padding-right: 1rem;
}

</style>

