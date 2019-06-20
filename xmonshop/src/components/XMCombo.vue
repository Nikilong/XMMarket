<template>
    <div class="container">
        <popup v-model="showCombo" position="bottom" max-height="80%" style="background:white;">
            <div class="popup_content">
                <p class="total_price_lab">共计:￥{{totalPrice}}</p>
                <div class="combo_cell" :class="{'pad-bottom':!showNum}" v-for="item,groIndex in combo">
                    <p v-text="item.name" class="combo_title"></p>
                    <div class="combo_check_div">
                        <span class="combo_checkbox" :class="{combo_checkbox_select:index===item.selectIndex}"  v-text="ele.type" v-for="ele,index in item.values" @click="selectComboCheck(groIndex,index,ele.price)"></span>
                    </div>

                </div>
                <div class="combo_cell_num" v-if="showNum">
                    <x-number title="购买数量" align="right"  button-style="square" :min="1" :max="99" v-model="proNum" :fillable="true"></x-number>
                </div>
            </div>
            <div class="xm_btn" @click="comboDidClick">确定</div>
        </popup>
    </div>
</template>

<script>
import {Popup,Checker, CheckerItem,XNumber} from "vux";

export default {
    name:"xmcombo",
    props:{
        "combo":{
            type:Array,
            default(){
                return []
            }
        },
        "showNum":{
            type:Boolean,
            default(){
                return true
            }
        },
    },
    components:{Popup,Checker, CheckerItem,XNumber},
    data(){
        return {
            showCombo:false,
            proNum:1,		// 购买数目
        }
    },
    computed:{
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
    methods:{
        show:function(shuldShow){
            this.showCombo = shuldShow
        },
        comboDidClick:function(){
            // 型号
            let typeStr = "";
			for(let i=0;i<this.combo.length;i++){
				let selectData = this.combo[i];
				typeStr = typeStr+"-"+selectData.values[selectData.selectIndex].type
            }
            typeStr = typeStr.substring(1)
            
            // 单价
            let perPri = this.totalPrice / this.proNum;

            this.$emit("comboDidClick",typeStr,this.proNum,perPri)
            this.showCombo = false
        },
        selectComboCheck:function(groIndex,index,price){
			this.combo[groIndex].selectIndex = index;
		},
    },
}
</script>


<style scoped>
.container{
}
.pad-bottom{
    padding-bottom:0.5rem;
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
</style>

