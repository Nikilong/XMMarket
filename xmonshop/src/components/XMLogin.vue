<template>
  <div class="container">
    <!-- 提醒类 -->
		<confirm v-model="showConfirm.show" :content="showConfirm.content" :show-cancel-button="false"></confirm>
    <toast v-model="showToast.show" :type="showToast.type">{{showToast.content}}</toast>
    <!-- 登录界面 -->
    <div>   
      <transition name="v-animate-bounce">
        <h1 v-show="showLoginPage">Welcome Back XMonShop</h1>
      </transition>
      <transition name="v-animate-slideToLeft">
        <div  v-show="showLoginPage">
          <form @submit.prevent="login">
            <p>
              账号:
              <input v-model="user.account" name="account">
            </p>
            <p>
              密码:
              <input v-model="user.password" type="password" name="password">
            </p>
            <input type="submit" value="登录">
          </form>
          <div class="flex-box">
            <button @click="showNewForm(1)" class="btn_block">新建用户</button>
            <button @click="showNewForm(2)" class="btn_block">修改密码</button>
          </div>
        </div>
      </transition>
    </div>

    <!-- 创建新用户 -->
    <transition name="v-animate-slideToTop"   v-on:after-leave="showLoginPage=true">
      <form @submit.prevent="addNewUser" v-if="showCreatPage">
        <div>
          <p class="flex-box" v-for="item,index in userNew">
            
            <span class="flex-item-lab"><span v-if="index===0 && checkAccountTips.show" class="checkAccount-tip"><icon :type="checkAccountTips.type"></icon></span>{{item.name}}:</span>
            <input class="flex-item-input" v-model="item.value" :name="item.dsName" :ref="item.dsName" :type="item.type"  @blur.prevent="inputBlurEvent($event,1,item.dsName)">
            
            <span class="flex-item-ft">
              <a v-if="item.require">*</a>
            </span>
          </p>
        </div>
        <input type="submit" value="注册">
        <div class="flex-box">
          <button @click.prevent="showNewForm(1)" class="btn_block">返回登录</button>
        </div>
      </form>
    </transition>
    
    <!-- 修改密码 -->
    <transition name="v-animate-slideToTop" v-on:after-leave="showLoginPage=true">
      <form @submit.prevent="changePassword" v-if="showPwdPage">
        <div>
          <p  class="flex-box" v-for="item in userPwd">
            <span class="flex-item-lab">{{item.name}}:</span>
            <input class="flex-item-input" v-model="item.value" :name="item.dsName" :ref="item.dsName" :type="item.type">
            <span class="flex-item-ft"></span>
          </p>
        </div>
        <input type="submit" value="修改">
        <div class="flex-box">
          <button @click.prevent="showNewForm(2)" class="btn_block">返回登录</button>
        </div>
      </form>
    </transition>

  </div>
</template>

<script>
import commonUtil from '../common/common'
import {Loading,Toast,Confirm,Icon} from 'vux'
import { setTimeout } from 'timers'

export default {
  name: "xmlogin",
  props: {
    userName: {
      type: String,
      default: "Niki"
    }
  },
  components:{
    Loading,Toast,Confirm,Icon
  },
  data() {
    return {
      user: {},
      userPwd:[
        {name: "账号",dsName: "account",value: "",type: "text"},
        {name: "密码",dsName: "oldOriPwd",value: "",type: "password"},
        {name: "新密码",dsName: "newOriPwd",value: "",type: "password"},
        {name: "确认密码",dsName: "newOriPwdConfirm",value: "",type: "password"},
      ],
      userNew: [
        {name: "账号",require: true,dsName: "account",value: "",type: "text"},
        {name: "姓名", require: true,dsName: "name",value: "",type: "text" },
        {name: "密码",require: true,dsName: "password",value: "",type: "password"},
        {name: "确认密码",require: true,dsName: "passwordConfirm",value: "", type: "password"},
        {name: "电话",require: false,dsName: "phone",value: "",type: "text" },
        {name: "邮箱",require: false,dsName: "email", value: "",type: "text"}
      ],
      showLoginPage: false, // 登录界面
      showCreatPage: false, // 新建账号界面
      showPwdPage: false, // 修改密码界面
      showConfirm:{ // 共用提醒
          show:false,
          content:""
      },
      showToast:{ // 共用提醒
          show:false,
          content:"",
          type:"success"
      },
      checkAccountTips:{
        show:false,
        type:""
      }
    };
  },
  computed: {
  },
  created:function(){
    console.log("-----login---creat")
    window.postMessage("hideTabbar","*")
    let _this = this
    setTimeout(() => {
      _this.showLoginPage = true
    }, 0);
  },
  methods: {
    XMToast:function(type,content){
      this.showToast.show = true
      this.showToast.type = type
      this.showToast.content = content
    },
    XMComfirm:function(content){
      this.showConfirm.show = true
      this.showConfirm.content = content
    },
    login: function() {
      if (String(this.user.account).trim() === "") {
        this.XMToast("cancel","账号不能为空")
      } else if (String(this.user.password.trim()) === "") {
        this.XMToast("cancel","密码不能为空")
      } else {
        this.$vux.loading.show({text: '登录中'})
        let data = {
          HEADER: {},
          PARAMS: {
            account: this.user.account,
            password: this.user.password
          },
          SERVICE: "LoginService.login"
        };
        let _this = this;
        this.$axios({
          url: commonUtil.serverUri(),
          method: "post",
          data: data
        }).then(
          function(response) {
            _this.$vux.loading.hide();
            console.log(response.data);
            if (response.data.status === "success") {
              _this.XMToast("success",'登陆成功')

              let userMsg = response.data.userMsg; 
              commonUtil.setCookie("_accesstoken",userMsg.accesstoken,new Date(userMsg.expire_time))
              commonUtil.setCookie("_account",userMsg.account)
              commonUtil.setCookie("_userName",userMsg.name)
              commonUtil.setCookie("_userId",userMsg.id)

              let itemId = commonUtil.getQueryString("itemId")
              let type = commonUtil.getQueryString("type")
              setTimeout(() => {
                if(itemId && type==="1"){
                  _this.$router.push({path:"/detail",query:{itemId:itemId}})
                }else if(itemId && type==="2"){
                  _this.$router.push("/addressList")
                }else{
                  _this.$router.push("home")
                }
              }, 1000);
            } else {
              _this.XMComfirm(response.data.msg)
            }
          },
          function(err) {
            console.log(err.response.data)
            _this.$vux.loading.hide();
            _this.XMComfirm(err.response.data.error.message)
          }
        );
      }
    },
    showNewForm: function(type) {
      for (let index in this.userNew) {
        this.userNew[index].value = "";
      }
      
      let _this = this
      if(this.showLoginPage === true){
        this.showLoginPage = false
        setTimeout(() => {
          if (type === 1) {
            // 新建
            _this.showCreatPage = true
          } else if (type === 2) {
            // 改密码
            _this.showPwdPage = true
          }
        }, 1000);
      }else{
        if (type === 1) {
          // 新建
          this.showCreatPage = false
        } else if (type === 2) {
          // 改密码
          this.showPwdPage = false
        }
      }
    },
    changePassword: function() { //修改密码
      if (this.$refs.newOriPwd[0].value != this.$refs.newOriPwdConfirm[0].value && this.$refs.newOriPwd[0].value != '') {
        this.XMToast("cancel",'确认密码和密码不一致')
        return;
      }

      let nullTip = '';
      let dataMap = {};
      for (let item of this.userPwd) {
        if (item.value.trim() === '') {
          nullTip = item.name + '不能为空';
          break;
        }
        dataMap[item.dsName] = item.value || '';
      }
      if (nullTip != '') {
        this.XMToast("cancel",nullTip)
        return;
      }
      // console.log(dataMap);
      let data = {
        HEADER: {},
        PARAMS: dataMap,
        SERVICE: "LoginService.changePassword"
      };
      let _this = this;
      this.$axios({
        url: commonUtil.serverUri(),
        method: "post",
        data: data
      }).then(function(response) {
        console.log(response.data);
        if (response.data.status === "success") {
          
          _this.XMToast("success","修改密码成功")
          setTimeout(() => {
            for (let i = 0; i < _this.userPwd.length; i++) {
              _this.userPwd[i].value = "";
            }
            _this.showNewForm(2)
          }, 1000);
        } else {
          _this.XMComfirm(response.data.msg)
        }
      });
    },
    addNewUser: function() { //创建新用户
      if (this.checkAccountTips.show == true && this.checkAccountTips.type==="cancel") {
          this.XMToast("cancel",'账号已被注册')
          return;
      }
      if (this.$refs.password[0].value != this.$refs.passwordConfirm[0].value && this.$refs.password[0].value != '' ) {
        this.XMToast("cancel",'确认密码和密码不一致')
        return;
      }

      let nullTip = '';
      let dataMap = {};
      for (let item of this.userNew) {
        if (item.require && item.value.trim() === '') {
          nullTip = item.name + '不能为空';
          break;
        }
        dataMap[item.dsName] = item.value || '';
      }
      if (nullTip != '') {
        this.XMToast("cancel",nullTip)
        return;
      }
      // let dataMap = {
      //     account: 'liwei',
      //     email: 'liwei@163.com',
      //     name: '李伟',
      //     password: '1',
      //     passwordConfirm: '1',
      // }
      // console.log(dataMap);
      let data = {
        HEADER: {},
        PARAMS: dataMap,
        SERVICE: "LoginService.creatAccount"
      };
      let _this = this;
      this.$axios({
        url: commonUtil.serverUri(),
        method: "post",
        data: data
      }).then(function(response) {
        console.log(response.data);
        if (response.data.status === "success") {
          _this.XMToast("success","注册成功")
           setTimeout(() => {
             for (let i = 0; i < _this.userNew.length; i++) {
               _this.userNew[i].value = "";
             }
            _this.showNewForm(1)
          }, 1000);
        } else {
          _this.XMComfirm(response.data.msg)
        }
      });
    },
    inputBlurEvent:function(e,groupType,dsName){
      if(groupType === 1){ // 新建用户
          if(dsName === "account"){
            if(e.target.value.trim().length > 0){
              this.checkAccountExist(false)
            }
          }

      }

      let contente =  e.target.value
    },
    checkAccountExist:function(showToast){  // 检查账号
      if (this.$refs.account[0].value.trim() === "") {
          this.XMToast("cancel","账号不能为空")
          return;
        }
        let data = {
          HEADER: {},
          PARAMS: {
            account: this.$refs.account[0].value
          },
          SERVICE: "LoginService.checkAccount"
        };
        let _this = this
        this.$axios({
          url: commonUtil.serverUri(),
          method: "post",
          data: data
        }).then(
          function(response) {
            console.log(response.data);
            if(showToast === false){
              _this.checkAccountTips.show = true
              _this.checkAccountTips.type = response.data.status === "success" ? "success" : "cancel"
            }else{
              _this.XMToast("text",response.data.msg)
            }
          },
          function(err) {
            console.log(err.response.data);
            if(showToast != false){
              _this.XMComfirm(err.response.data.error.message)
            }
          }
        );
    },
  }
};
</script>


<style scoped>
@import '../common/commonStyle';

.container{
  padding: .7rem;
  margin-top: 3rem;
}
form input {
  border: solid 1px gray;
}

.flex-box {
  display: flex;
  align-items: center;
  justify-content: center;
}
.flex-item-lab{
  flex:3;
  text-align:right;
  padding-right:.4rem;
}
.flex-item-input{
  flex:5;
  text-align:left;
  padding:.4rem;
}
.flex-item-ft{
  flex:2;
  text-align:left;
  padding-left:.4rem;
}

.flex-box button {
  border: solid 1px gray;
  border-radius: 5px;
  height: 1.5rem;
  background-color: #eeeeee;
  border-radius: 1rem;
  font-size: 0.5rem;
}

form input[type="submit"] {
  width: 50%;
  height: 2rem;
  background-color: #eeeeee;
  border-radius: 1rem;
  font-size: 1rem;
}
.btn_block {
  margin: 0.5rem;
}
</style>


