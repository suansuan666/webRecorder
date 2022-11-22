import Vue from 'vue'
import App from './App.vue'
import Lui from '@lui/lui-ui'
import '@lui/lui-ui/lib/theme-chalk/index.css'


Vue.config.productionTip = false
Vue.use(Lui);

new Vue({
  render: h => h(App),
}).$mount('#app')
