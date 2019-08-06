<template>
    <div class="container">
        <group>
            <x-input name="username" v-model="inputData.name.value" placeholder="请输入姓名" is-type="china-name"></x-input>
            <x-input name="mobile" v-model="inputData.phone.value" placeholder="请输入手机号码" keyboard="number" is-type="china-mobile"></x-input>
            <x-address title=""  @on-hide="logHide" @on-show="logShow" v-model="areaCode" :list="addressData" @on-shadow-change="onShadowChange" inline-desc="省、市、区"></x-address>
            <x-input name="address" v-model="inputData.address.value" placeholder="请输入详细地址"></x-input>
        </group>

        <div class="ft_bar">
            <div class="tool_bar">
               <div class="new_btn bg-gray c-white" @click="addNewAddress">保存</div>
            </div>
        </div>

    </div>
</template>

<script>

import { Group,XInput, XAddress, ChinaAddressV4Data, XButton, Value2nameFilter as value2name } from 'vux'
import { constants } from 'fs';


export default {
    name:"xmnewaddress",
    components:{
        Group,XInput,XAddress,XButton
    },
    data(){
        return {
            areaCode:[],  // 区域代码
            addressData: ChinaAddressV4Data, // 地址数据源
            inputData:{name:{value:"",dsName:"姓名"},phone:{value:"",dsName:"手机号码"},area:{value:"",dsName:"区域"},areaCode:{value:"",dsName:"区域代码"},address:{value:"",dsName:"详细地址"}},   // 填写数据
            isNew:false, // 是否新建
            addressId:0, // 地址的id
        }
    },
    computed:{
        selectAddStr:function(){
            return ""
        }
    },
    methods:{
        addNewAddress(){
            let posData = {}
            for (let key in this.inputData){
                let ele = this.inputData[key]
                if(ele.value.trim() === ""){
                    let errStr = `《${ele.dsName}》不能为空`
                    this.$nkUtil.toast("warn",errStr)
                    return
                }else{
                    posData[key] = ele.value
                }
            }
            posData.senderId = this.$nkUtil.getCookie('_userId')
            posData.id = this.addressId
            let serverUri = this.isNew ? "AddressService.addNewAddress" : "AddressService.saveAddress"
			let data = {
					HEADER: {},
					PARAMS: posData,
                    SERVICE: serverUri
                };
            console.log(posData)
			let _this = this;
			this.$axios({
					url: _this.$nkUtil.serverUri(),
					method: "post",
					data: data
				}).then(function(response) {
					// 恢复加载标志
					console.log(response.data);
					if (response.data.status === "success") {
						_this.$router.push("addressList")
					} else {
						this.$nkUtil.toast("warn","无数据")
					}
				});

        },
        onShadowChange (ids, names) {
            console.log(ids, names)
            this.inputData.areaCode.value = ids.join(" ")
            this.inputData.area.value = names.join(" ")
        },
        logHide (str) {
            console.log('on-hide', str)
        },
        logShow (str) {
            console.log('on-show')
        },
    },
    created(){
        this.isNew = this.$nkUtil.getQueryString("isNew") === "true" ? true : false
        if(!this.isNew){
            let params = this.$route.params
            this.inputData.name.value = params.name
            this.inputData.phone.value = params.phone
            this.inputData.area.value = params.area
            this.inputData.areaCode.value = params.areaCode
            this.inputData.address.value = params.address
            this.addressId = params.id
            this.areaCode = params.areaCode.split(" ")
        }else{
            // 初始化默然是广东广州天河区
            this.areaCode=["440000", "440100", "440106"]
        }
    },
}
</script>

<style scoped>

.container{
}


.new_btn{
    width:100%;
    height: 3rem;
    line-height: 3rem;
}

</style>

