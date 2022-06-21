<template>
  <div class="web-recorder">
    <div class="web-recorder-warpper" v-if="isScreenShareSupported && isWebRTCSupported">
      <span class="web-recoder-rec" v-show="status == 'recording' && screenShow">REC</span>
      <div v-show="screenShow" class="web-recorder-video-box">
        <video ref="screen-share" autoplay class="web-recorder-video" />
        <i class="el-icon-error web-recorder-close" @click="handleHideSreen"></i>
      </div>
      <el-button 
        type="primary" 
        @click="handleSrceenShare"  
        v-show="openScreenShare" 
        size="mini"
        icon="el-icon-video-camera-solid"
        round
      > 
        录屏
      </el-button>
      <div class="action-group">
        <el-button type="primary" @click="handleStart" v-show="startRecord" size="mini"> 开始录屏 </el-button>
        <el-button type="warning" @click="handlePause" v-show="pauseRecord" size="mini"> 暂停录屏 </el-button>
        <el-button type="primary" @click="handleResume" v-show="resumeRecord" size="mini"> 继续录屏 </el-button>
        <el-button type="danger" @click="hanldeStop" v-show="stopRecord" size="mini"> 停止录屏 </el-button>
        <el-button type="danger" @click="handleExit" v-show="exitRecord" size="mini"> 退出录屏 </el-button>
        <el-button type="success" @click="handleDownload" v-show="downloadShow" size="mini">下载录屏</el-button>
      </div>
       
    </div>
    <h2 v-else>Sorry! WebRTC is not fully supported on your browser! Please install latest Chrome on your computer and try this page again.</h2>
  </div>
</template>

<script>
export default {
  name:'webRecorder',
  data() {
    return {
      blobs:[],
      recorder:null,
      localScreenShareStream: null,
      blobUrl: '',
      isScreenShareSupported: false,
      isWebRTCSupported: false,
      showREC: false,
      screenShareVideoElement:null,
      status:'',
      screenShow:false,
      openSrceen: true,
      startRecord: false,
      pauseRecord: false,
      resumeRecord: false,
      stopRecord: false,
      openScreenShare:true,
      downloadShow:false,
      exitRecord:false,
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
    async handleSrceenShare(){
      // mediaDevices.getUserMedia() 信息流捕获 参数里可以去指定媒体类型
      // const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // mediaDevices.getDisplayMedia()屏幕捕获  用户选择和授权展示的窗口
      this.localScreenShareStream = await navigator.mediaDevices.getDisplayMedia();
      // this.localScreenShareStream.addTrack(tempStream.getAudioTracks()[0]); // 添加音频轨道
      const screenShareTrack = this.localScreenShareStream.getVideoTracks()[0];
      if (screenShareTrack) {
        screenShareTrack.onended = this.onScreenShareEnded;
        screenShareTrack.onmute = this.onScreenShareEnded;
      }
      this.recorder = new MediaRecorder(this.localScreenShareStream);
      this.recorder.onstop = this.onRecordStopped;
      this.recorder.ondataavailable = this.onDataAvailable;

      this.$refs['screen-share'].srcObject = this.localScreenShareStream;
      this.$refs['screen-share'].muted = true;
      this.openScreenShare = false;
      this.startRecord = true;
      this.screenShow = true;
      this.exitRecord = true;
    },
    onDataAvailable (e) {
      this.blobs.push(e.data);
    },
    onRecordStopped () {
      const blob = new Blob(this.blobs, { 'type': 'video/webm' });
      this.blobUrl = URL.createObjectURL(blob);
      this.blobs = [];
      this.downloadShow = true;
    },
    onScreenShareEnded () {
      if (this.localScreenShareStream === null) {
        return;
      }
      console.log('screen share ended')
      this.hanldeStop();
      this.localScreenShareStream = null;
      this.$refs['screen-share'].srcObject = null;
      this.initStatus()
    },
    handleStart () {
      this.recorder.start();
      this.status = 'recording';
      this.startRecord = false;
      this.pauseRecord = true;
      this.stopRecord = true;
      this.resumeRecord = false;
      this.downloadShow = false;
      this.$message.success('已开始屏幕录制')
    },
    handlePause () {
      this.recorder.pause();
      this.status = 'pause';
      this.pauseRecord = false;
      this.resumeRecord = true;
      this.downloadShow = false;
      this.$message.warning('已暂停录制')
    },
    handleResume () {
      this.recorder.resume();
      this.status = 'recording';
      this.pauseRecord = true;
      this.resumeRecord = false;
      this.downloadShow = false;
      this.$message.warning('已恢复录制')
    },
    hanldeStop () {
      if (this.recorder.state !== 'inactive') {
        this.recorder.stop();
      }
      this.status = 'stop';
      this.startRecord = true;
      this.pauseRecord = false;
      this.stopRecord = false;
      this.resumeRecord = false;
      this.$message.error('已停止录制')
    },
    handleDownload () {
      const link = document.createElement('a');
      link.href = this.blobUrl;
      link.download = 'video';
      link.click(); 
      URL.revokeObjectURL(link.href);
      this.blobUrl = '';
    },
    // 退出录制
    handleExit(){
      const stream =  this.$refs['screen-share'].srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(function(track) {
        track.stop();
      });
      this.initStatus();
      this.$refs['screen-share'].srcObject = null;
    },
    // 初始化状态
    initStatus(){
      this.status = '',
      this.screenShow = false,
      this.openSrceen = true,
      this.startRecord = false,
      this.pauseRecord = false,
      this.resumeRecord = false,
      this.stopRecord = false,
      this.openScreenShare = true,
      this.downloadShow = false;
      this.exitRecord = false;
    },
    // 隐藏视屏框
    handleHideSreen(){
      this.screenShow = false;
    },
    // 文件分片处理
    // sliceFile(file,piece){
    //   let start = 0;
    //   let chunckList = [];
    //   while(start < file.size) {
    //     chunckList.push({ file: file.slice(start, start + piece)});
    //     start += piece
    //   }
    //   return chunckList
    // },
    
    // 上传分片
    // uploadFile(file){
    //   const piece = 1024 * 1024 * 0.1;
    //   let chunck = this.sliceFile(file,piece);
    //   // 创建 context参数，用于区分切片文件来源
    //   const context = `${file.name} + ${file.length}`;
    //   let tasks = [];
    //   chunck.forEach((chunck,index) => {
    //     let fd = new FormData();
    //     fd.append("file",chunck);
    //      // 传递context
    //     fd.append("context", context);
    //     // 传递切片索引值
    //     fd.append("chunk", index + 1);
    //     tasks.push(post('xxx'))
    //   })
    //   Promise.all(tasks).then(res => {
    //     let fd = new FormData();
    //     fd.append("context", context);
    //     fd.append("chunks", chunks.length);
    //     post("xx", fd).then(res => {
    //     console.log(res);
    //     });
    //   })
    // }
    // 
  }
}
</script>

<style scoped>
.web-recorder {
  position: relative;
  width:300px;
  z-index:999;
  text-align: right
}
.web-recorder-warpper {
  position: relative;
}
.web-recorder-video {
  width: 300px;
  height:100%;
  background-color: #2c3e50;
  margin:0 auto;
}
.web-recorder-video-box {
  position: relative;
  width: 300px;
}
.web-recorder-close {
  position: absolute;
  right:0px;
  top:-10px;
  color:black;
  font-size: 20px;
  cursor: pointer;
  z-index:999;
}
.web-recoder-rec {
  position: absolute;
  background: red;
  color: #fff;
  left:0;
  z-index:99;
  padding: 0 4px;

}
.action-group {
  text-align: left;
}
</style>
