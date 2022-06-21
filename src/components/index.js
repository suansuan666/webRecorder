import Vue from 'vue'
import WebRecorder from './WebRecorder.vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

// const Components = {
//     WebRecorder
// } 
// Object.keys(Components).forEach(name => {
//     Vue.component(name,Components[name])
// })
// export default Components

const Recorder = {};
// Recorder.install = function(Vue) {
//     const RecorderConstructor = Vue.extend(WebRecorder);
//     const instance = new RecorderConstructor();
//     instance.$mount(document.createElement('div'))
//     document.body.appendChild(instance.$el);
//     Vue.prototype.$recorder = (msg, duration = 2000) => {
//         instance.message = msg;
//         instance.show = true;
//         setTimeout(() => {
//             instance.show = false;
//         }, duration);
//     }
// }
Recorder.install = (Vue) => {
    Vue.component('recorder', WebRecorder)
}
export default Recorder;