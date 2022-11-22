import Vue from 'vue'
import WebRecorder from './WebRecorder.vue'
import Lui from '@lui/lui-ui'
import '@lui/lui-ui/lib/theme-chalk/index.css'
Vue.use(Lui);

// const Components = {
//     WebRecorder
// } 
// Object.keys(Components).forEach(name => {
//     Vue.component(name,Components[name])
// })
// export default Components

const Recorder = {};
Recorder.install = (Vue) => {
    Vue.component('recorder', WebRecorder)
}
export default Recorder;