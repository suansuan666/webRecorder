<template>
  <div>
    <div class="record" v-if="isScreenShareSupported && isWebRTCSupported">
      <h2>Record</h2>
      <span class="rec" v-show="status == 'recording'">REC</span>
      <video ref="screen-share" autoplay />
      <div class="action-group">
        <button @click="openScreenShare" :disabled="disabled.open">open screen share</button>
        <button @click="start" :disabled="disabled.start"> start </button>
        <button @click="pause" :disabled="disabled.pause"> pause </button>
        <button @click="resume" :disabled="disabled.resume"> resume </button>
        <button @click="stop" :disabled="disabled.stop"> stop </button>
      </div>
    </div>
    <h2 v-else>Sorry! WebRTC is not fully supported on your browser! Please install latest Chrome on your computer and try this page again.</h2>
    <div class="preview" v-if="blobUrl">
      <h2>Preview</h2>
      <video :src="blobUrl" autoplay controls></video>
      <button @click="handleDownload" class="download-button">download</button>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      blobs:[],
      recorder:null,
      localScreenShareStream: null,
      disabled: {
        open: false,
        start: true,
        pause: true,
        resume: true,
        stop: true,
      },
      blobUrl: '',
      isScreenShareSupported: false,
      isWebRTCSupported: false,
      showREC: false,
      screenShareVideoElement:null,
      blobFile:null,
      status:''
    }
  },
  created(){
    if(navigator && navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      this.isScreenShareSupported = true
    }
    if(navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      this.isWebRTCSupported = true
    }
  },
   mounted () {
    this.screenShareVideoElement = this.$refs['screen-share'];
  },
  methods:{
    async openScreenShare(){
      const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // console.log(tempStream,'=====stream')
      this.localScreenShareStream = await navigator.mediaDevices.getDisplayMedia();
      // console.log(this.localScreenShareStream,'=====sharestream')
      this.localScreenShareStream.addTrack(tempStream.getAudioTracks()[0]);
      // console.log(tempStream.getAudioTracks(),'=====track')
      const screenShareTrack = this.localScreenShareStream.getVideoTracks()[0];
      // console.log(screenShareTrack,'===screen')
      if (screenShareTrack) {
        screenShareTrack.onended = this.onScreenShareEnded;
        screenShareTrack.onmute = this.onScreenShareEnded;
      }
      this.recorder = new MediaRecorder(this.localScreenShareStream);
      let types = ["video/webm","audio/webm","video/webm;codecs=vp8","video/webm;codecs=daala","video/webm;codecs=h264","audio/webm;codecs=opus","video/mpeg",'video/mp4','video/mp4'];
        for (var i in types) {
          console.log( "Is " + types[i] + " supported? " + (MediaRecorder.isTypeSupported(types[i]) ? true : false));
        }

      this.recorder.onstop = this.onRecordStopped;
      this.recorder.ondataavailable = this.onDataAvailable;

      this.$refs['screen-share'].srcObject = this.localScreenShareStream;
      this.$refs['screen-share'].muted = true;
      this.disabled.open = true;
      this.disabled.start = false;
    },
    onDataAvailable (e) {
      console.log(e,'====e')
      this.blobs.push(e.data);
    },
    onRecordStopped () {
      const blob = new Blob(this.blobs, { 'type': 'video/webm' });
      this.blobFile = blob;
      console.log(this.blobs,blob,'===blob')
      this.blobUrl = URL.createObjectURL(blob);
      console.log(this.blobUrl,'====url')
      this.blobs = [];
    },
    onScreenShareEnded () {
      if (this.localScreenShareStream === null) {
        return;
      }
      console.log('screen share ended')
      this.stop();
      this.localScreenShareStream = null;
       this.$refs['screen-share'].srcObject = null;

      this.disabled.open = false;
      this.disabled.start = true;
    },
    start () {
      this.recorder.start();
      this.status = 'recording';
      this.disabled.start = true;
      this.disabled.pause = false;
      this.disabled.stop = false;
    },
    pause () {
      this.recorder.pause();
      this.status = 'pause';
      this.disabled.pause = true;
      this.disabled.resume = false;
    },
    resume () {
      this.recorder.resume();
      this.status = 'recording';
      this.disabled.pause = false;
      this.disabled.resume = true;
    },
    stop () {
      if (this.recorder.state !== 'inactive') {
        this.recorder.stop();
      }
      this.status = 'stop';
      this.disabled.start = false;
      this.disabled.pause = true;
      this.disabled.resume = true;
      this.disabled.stop = true;
    },
    handleDownload () {
      const link = document.createElement('a');
      link.href = this.blobUrl;
      link.download = 'video.webm';
      link.click();
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = '';
    }
  }
}
</script>

<style scoped>
video {
  width: 500px;
  background-color: #2c3e50;
  margin:0 auto;
}
.record {
  text-align: center;
}
.rec {
  position: absolute;
  background: red;
  color: #fff;
  padding: 0 4px;
}

.preview {
  margin-left: 24px;
}

.download-button {
  display: block;
  margin: 0 auto;
}
</style>
