import Vue from 'vue'
// import Router from 'vue-router'

// import xmlogin from '@/components/XMLogin'
// import xmhome from '@/components/XMHome'
// import xmdetail from '@/components/XMDetail'

// Vue.use(Router)

export default new Router({
    routes: [{
        path: '/',
        name: 'HelloWorld',
        component: HelloWorld
    }]
})

// export default new Router({
//     mode: 'history',
//     routes: [{
//         path: '/login',
//         name: 'xmlogin',
//         component: xmlogin,
//     }, {
//         path: '/',
//         name: 'xmhome',
//         component: xmhome
//     }, {
//         path: '/detail',
//         name: 'xmdetail',
//         component: xmdetail
//     }]
// })