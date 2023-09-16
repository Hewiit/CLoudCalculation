// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import './assets/element.css'
import Element from 'element-ui'
import * as echarts from 'echarts'
import 'jquery'
import '@/assets/iconfont/iconfont.js'
import '@/assets/common.css'
import Clipboard from 'v-clipboard'


Vue.use(Element);
Vue.use(echarts);
Vue.use(Clipboard)

import { alert_msg, alert_box, ajax } from './assets/global.js'
import { login_manager } from './assets/login_state.js'
Vue.prototype.alert_msg = alert_msg;
Vue.prototype.alert_box = alert_box;
Vue.prototype.ajax = ajax;
Vue.prototype.login_manager = login_manager;

Vue.config.productionTip = false;
Vue.prototype.$echarts = echarts;
Vue.prototype.$host = 'http://localhost:8000'


router.beforeEach((to, from, next) => {
//   // TODO: 权限
//   const role = localStorage.getItem('roles') ? localStorage.getItem('roles') : 'none';
//   if(!to.meta.roles){
//     alert('Panic: this page has not roles!');
//     return;
//   }
//   if(to.meta.roles.includes(role)){
//     if (to.meta.title) {
//       document.title = to.meta.title
//     }
//     next();
//   }
//   else{
//     if(role == 'admin'){
//       router.push({name: 'admin'});
//     }
//     else{
//       router.push({name: 'index'});
//     }
//   }
    if (to.meta.title) {
        document.title = to.meta.title + ' - PaaS云平台';
    }
    next();
})

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    components: { App },
    template: '<App/>',
})

