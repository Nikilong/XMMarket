<template>
  <div id="app">
    <router-view></router-view>
    
    <div class="ft_bar" v-if="showTabbar">
      <div class="tool_bar">
          <tabbar @on-index-change="tabbarDidClick">
            <tabbar-item :selected="activeTab===0" :show-dot="true" link="/home">
              <img slot="icon" src="./assets/icons/home_icon.svg">
              <span slot="label">首页</span>
            </tabbar-item>
            <tabbar-item :selected="activeTab===1"  :badge="cartsCount" link="/carts">
              <img slot="icon" src="./assets/icons/cart_icon.svg">
              <span slot="label">购物车</span>
            </tabbar-item>
            <tabbar-item :selected="activeTab===2" link="/setting">
              <img slot="icon" src="./assets/icons/my_icon.svg">
              <span slot="label">设置</span>
            </tabbar-item>
          </tabbar>
      </div>
    </div>
    <!-- <xmlogin userName="Tom" v-show="showLogin" @loginEvent="loginListen"></xmlogin> -->
    <!-- <xmhome v-show="showShop"  @logoutEvent="logoutListen" @openDetail="openProductionDetail" :userName="loginUserName"></xmhome> -->
    <!-- <xmhomeTaobao v-show="showShop"  @logoutEvent="logoutListen"></xmhomeTaobao> -->
    <!-- <xmdetail v-show="showDetail" ref="detailPage" :itemData="currentProData" @backToShop="backToShopList"></xmdetail> -->
  </div>
</template>

<script>
// import xmlogin from "./components/XMLogin"
// import xmhome from "./components/XMHome"
// import xmhomeTaobao from "./components/XMHomeTaobao"
// import xmdetail from "./components/XMDetail"
import commonUtil from './common/common'


import {Tabbar, TabbarItem} from "vux";

export default {
  name: "App",
  components: {
    // xmlogin,
    // xmhome,
    // xmhomeTaobao,
    // xmdetail,
    Tabbar, TabbarItem
  },
  data() {
    return {
      showTabbar:true,
      activeTab:0,   // 当前选中的tab
      cartsCount:"0",  // 购物车数量
    };
  },
  created: function() {
    let _this = this
    window.addEventListener("message",this.handleMessage,false)
  },
  destroyed:function(){
    window.removeEventListener("message",this.handleMessage,false)
  },
  methods:{
    handleMessage:function(msg){
      if(msg.data === "showHome"){
        this.showTabbar = true
        this.activeTab = 0
        this.updateCart()
      }else if(msg.data === "showCarts"){
        this.showTabbar = true
        this.activeTab = 1
        this.updateCart()
      }else if(msg.data === "showSetting"){
        this.showTabbar = true
        this.activeTab = 2
        this.updateCart()
      }else if(msg.data === "hideTabbar"){
        this.showTabbar = false
      }

    },
    tabbarDidClick:function(index,preIndex){
      this.activeTab = index
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
					_this.cartsCount = String(response.data.cartList.length)
				} else {
					alert(response.data.msg)
				}
			});
		},
  }
};
</script>

<style>
@import './common/commonStyle';
body,#app{
  margin: 0;
  padding: 0;
}
p{
  margin-block-start: 0;
  margin-block-end: 0;
  margin-inline-start: 0;
  margin-inline-end: 0;
}
a{
  text-decoration: none;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* todo:待去掉这个text-align: center;属性,然后所有页面做适配 */
  text-align: center;  
  color: #2c3e50;
  /* margin-top: 60px; */
}

/* ------------------------weui统一样式 start------------------------ */
.weui-grid__label{
  font-size: 0.5rem !important;
}
/* todo:去掉#pp */
.vux-cell-bd,.vux-cell-primary p{
  text-align: left;
}
/* ------------------------weui统一样式 end------------------------ */
</style>

