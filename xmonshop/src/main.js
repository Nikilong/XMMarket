// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
// import router from './router'
import axios from 'axios'


//新建并引入组件
import XMLogin from '@/components/XMLogin'
import XMHome from '@/components/XMHome'
import XMDetail from '@/components/XMDetail'
import XMCarts from '@/components/XMCarts'
import XMSetting from '@/components/XMSetting'
import XMOrder from '@/components/XMOrder'
import XMAddressList from '@/components/XMAddressList'
import XMNewAddress from '@/components/XMNewAddress'

/*---------------axios-start----------------*/
Vue.prototype.$axios = axios
Vue.config.productionTip = false

/*---------------axios-end----------------*/

/*---------------VueRouter-start----------------*/
import VueRouter from "vue-router"
Vue.use(VueRouter)


//定义配置路由
const routes = [
    { path: '/login', name: "XMLogin", component: XMLogin },
    { path: '/home', name: "XMHome", component: XMHome },
    { path: '/detail', name: "XMDetail", component: XMDetail },
    { path: '/carts', name: "XMCarts", component: XMCarts },
    { path: '/order', name: "XMOrder", component: XMOrder },
    { path: '/setting', name: "XMSetting", component: XMSetting },
    { path: '/addressList', name: "XMAddressList", component: XMAddressList },
    { path: '/newAddress', name: "XMNewAddress", component: XMNewAddress },
    { path: '*', redirect: '/home' },
]

//实例化路由
const router = new VueRouter({
    mode: 'history', // 清除uri的*
    routes: routes
})

/*---------------VueRouter-end----------------*/

/*---------------vux-start----------------*/
import Vuex from 'vuex'
Vue.use(Vuex)

import vuexI18n from 'vuex-i18n'
let store = new Vuex.Store({
    modules: {
        i18n: vuexI18n.store
    }
})
import { TransferDom, Alert, Popup, Group, Cell, XButton, XSwitch, Scroller, Toast, XAddress, ChinaAddressData, Actionsheet, DatetimePlugin, LocalePlugin, DevicePlugin, ToastPlugin, AlertPlugin, ConfirmPlugin, LoadingPlugin, WechatPlugin, AjaxPlugin, AppPlugin } from 'vux'

Vue.use(DevicePlugin)
Vue.use(ToastPlugin)
Vue.use(AlertPlugin)
Vue.use(ConfirmPlugin)
Vue.use(LoadingPlugin)
Vue.use(WechatPlugin)
Vue.use(AjaxPlugin)
Vue.use(LocalePlugin)
Vue.use(DatetimePlugin)
Vue.use(vuexI18n.plugin, store)

/*---------------vux-end----------------*/


// import commonUtil from './common/common'
// Vue.use(commonUtil)

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router, // 挂载路由
    components: { App },
    template: '<App/>'
})