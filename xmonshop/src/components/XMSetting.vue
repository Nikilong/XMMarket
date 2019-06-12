<template>
  <div class="container">
      <div class="user_nav_tool">
				<span>{{userName===""?"您好,请":"欢迎您,"+userName}}</span>
				<span class="logout_btn c-red" @click="logout">{{userName===""?"登录":"注销"}}</span>
			</div>
      <group>
        <cell title="添加商品" value-align="left" is-link></cell>
      </group>    
  </div>
</template>



<script>

import commonUtil from "../common/common"
import { Loading,Cell,Group } from "vux"


export default {
  name: "xmboss",
  components: {
    Loading,Cell,Group
	},
   props:[],
  data() {
    return {
      userName:"",  // 登录用户名
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
    logout: function() 
    {
      commonUtil.setCookie("_accesstoken", "");
      commonUtil.setCookie("_account", "");
      commonUtil.setCookie("_userName", "");
			// this.$emit("logoutEvent", { status: "success", msg: "注销成功!!!" });
			this.$router.push("login")
		},
  },
  created: function() {
    window.postMessage("showSetting","*")
    
    let _this = this
		this.avalidToken(function(data){
			// 检测用户是否登录
			_this.userName = commonUtil.getCookie("_userName") || ""
			_this.canEdit = data.editRight> 5 ? true : false
		},function(err){
			_this.userName = ""
		})
  },
};
</script>

<style scoped>
@import '../common/commonStyle';
.container{
	margin-top: 40px;
}

.user_nav_tool {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  border: 1px solid gray;
  border-radius: 0.5rem;
  padding: 0.2rem 0.8rem;
  font-size: 0.8rem;
}
.logout_btn {
  text-decoration: red;
}

</style>

