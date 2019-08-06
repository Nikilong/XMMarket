import Vuex from 'vuex'
import Vue from 'vue'

import toastCenter from './modules/toastCenter'
import footerStatus from './modules/footerStatus'
import vuexI18n from 'vuex-i18n'

Vue.use(Vuex)

let store = new Vuex.Store({
    modules: {
        i18n: vuexI18n.store,
        toastCenter,
        footerStatus
    }
})

export default store