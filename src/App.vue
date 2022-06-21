<template>
  <div id="app">
    <web-recorder/>
    <!-- <recorder/> -->
    <!-- <rrweb-recorder/> -->
  </div>
</template>

<script>
import WebRecorder from './components/WebRecorder.vue'
// import recorder from './components/RecorderDemo'
// import RrwebRecorder from './components/RrwebRecorder.vue'
export default {
  name: 'App',
  components: {
    WebRecorder,
    // recorder
    // RrwebRecorder,
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
