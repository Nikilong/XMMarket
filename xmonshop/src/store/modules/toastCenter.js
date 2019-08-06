import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex)

const state = {
    showConfirmFlag: false, // confirm
    showToastFlag: false, // toast
    content: "",
    toastType: "",
}

const getters = {
    isShow(state) {
        return state.showConfirmFlag
    },
    confirmText(state) {
        return state.content
    },
    type(state) {
        return state.toastType
    }
}

const actions = {
    showToast(context, params) {
        context.commit('showConfirm', params)
    },
    hideToast(context) {
        context.commit('hideConfirm')
    }
}
const mutations = {
    showConfirm(state, params) {
        if (params.type) {
            state.showToastFlag = true
            state.toastType = params.type
        } else {
            state.showConfirmFlag = true
        }
        state.content = params.text
    },
    hideConfirm(state) {
        state.showConfirmFlag = false
        state.showToastFlag = false
    },
}

export default {
    namespaced: true, //用于在全局引用此文件里的方法时标识这一个的文件名
    state,
    getters,
    mutations,
    actions
}