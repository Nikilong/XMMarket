<template>
    <div class="container">

        <div class="pro_cell" v-for="item,daIndex in addsData" @click="selectAddress(daIndex)">
            <div class="pro_cell_title">{{item.name+" "+item.phone}}<span class="pro_cell_edit_btn" @click.stop="editAddress(daIndex)">编辑</span></div>
            <div class="pro_cell_type">{{item.area+" "+item.address}}</div>
        </div>

        <div class="ft_bar">
            <div class="tool_bar">
               <div class="new_btn bg-darkgray" @click="addNewAddress">添加新地址</div>
            </div>
        </div>
    </div>
</template>

<script>

import commonUtil from "../common/common"
import { Cell,Group } from "vux"

export default {
    name:"xmaddressList",
    components:{
        Cell,Group
    },
    data(){
        return {
            addsData:[],  // 数据列表
        }
    },
    methods:{
        addNewAddress(){
            this.$router.replace({path:'./newAddress',query:{isNew:"true"}})
        },
        queryAddressList(){
            let userId = commonUtil.getCookie('_userId')
            if(userId.trim().length === 0){
                this.$router.push({path:"/login",query:{type:"2"}})
            }
			let data = {
					HEADER: {},
					PARAMS: {id:userId},
                    SERVICE: "AddressService.queryAddress"
                };
			let _this = this;
			this.$axios({
					url: commonUtil.serverUri(),
					method: "post",
					data: data
				}).then(function(response) {
					// 恢复加载标志
					console.log(response.data);
					if (response.data.status === "success") {
                        let list = response.data.list
                        if(list.length === 0){
                            alert("无数据")
                        }else{
                            _this.addsData = Array.from(response.data.list)
                        }
					}
				});

        },
        editAddress(index){
            console.log("----")
            let params = this.addsData[index]
            this.$router.replace({name:"XMNewAddress",params:params})
        },
        selectAddress(index){
            console.log("++++++")
            let params = this.addsData[index]
            this.$router.replace({name:"XMOrder",params:params})
        },
    },
    created:function(){
        this.queryAddressList()
    },
}
</script>

<style scoped>
@import '../common/commonStyle';

.container{
    margin-bottom: 3rem;
}

.new_btn{
    width:100%;
    height: 3rem;
    line-height: 3rem;
}

.pro_cell{
    position: relative;
    padding: 0.8rem;
    text-align: left;
}

.pro_cell:after{
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

.pro_cell_edit_btn{
    float: right;
    border: 1px solid gray;
    border-radius: 0.3rem;
    padding:0.1rem 0.4rem;
    font-size: 0.8rem;
}

</style>

