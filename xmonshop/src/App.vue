<template>
  <div id="app">
    <router-view></router-view>
    
    <div class="ft_bar" v-if="showTabbar">
      <div class="tool_bar">
          <tabbar @on-index-change="tabbarDidClick">
            <tabbar-item :selected="activeTab===0" :show-dot="showProDot" link="/home">
              <img slot="icon" v-if="activeTab===0" src="./assets/tabbar/tabbar_home_se.svg">
              <img slot="icon" v-if="activeTab!=0" src="./assets/tabbar/tabbar_home.svg">
              <span slot="label">首页</span>
            </tabbar-item>
            <tabbar-item :selected="activeTab===1"  :badge="cartsCount" link="/carts">
              <img slot="icon" v-if="activeTab===1" src="./assets/tabbar/tabbar_cart_se.svg">
              <img slot="icon" v-if="activeTab!=1" src="./assets/tabbar/tabbar_cart.svg">
              <span slot="label">购物车</span>
            </tabbar-item>
            <tabbar-item :selected="activeTab===2" link="/setting">
              <img slot="icon" v-if="activeTab===2" src="./assets/tabbar/tabbar_my_se.svg">
              <img slot="icon" v-if="activeTab!=2" src="./assets/tabbar/tabbar_my.svg">
              <span slot="label">设置</span>
            </tabbar-item>
          </tabbar>
      </div>
    </div>
  </div>
</template>

<script>
import commonUtil from './common/common'


import {Tabbar, TabbarItem} from "vux";

export default {
  name: "App",
  components: {
    Tabbar, TabbarItem
  },
  data() {
    return {
      showTabbar:true,
      activeTab:0,   // 当前选中的tab
      cartsCount:"",  // 购物车数量
      showProDot:false,  // 商品是否有更新
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
      }else if(msg.data === "productionsHaveModify"){
        this.showProDot = true
      }else{
          try{
            if(msg.data.indexOf("updataCartsCount--")>-1){
              let count = String(msg.data).replace("updataCartsCount--","")
              if(count === "0") count = ""
              this.cartsCount = count
            }
          }catch(e){
          // console.log(e)
          }
      }

    },
    tabbarDidClick:function(index,preIndex){
      this.activeTab = index
    },
    updateCart:function() // 更新购物车数量
		{
      let _this = this
      this.avalidToken(function(resu){
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
            _this.cartsCount = response.data.cartList.length>0 ? String(response.data.cartList.length) : ""
          } else {
            _this.cartsCount = ""
          }
        });

      },function(err){
        _this.cartsCount = ""
      })
		},
  }
};
</script>

<style>
@import './common/commonStyle';
body,#app{
  margin: 0;
  padding: 0;
  width:100%;
  height:100%;
  overflow-x:hidden;
  overflow-y: scroll;
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
.weui-dialog__btn_primary{
  color:#4D3126;
}

.vux-popup-header-right {
  color:#4D3126 !important;
}
.weui-loadmore {
    margin:0.9rem auto !important;
}
/* ------------------------weui统一样式 end------------------------ */
</style>

