<template>
  <div class="web-recorder">
    <!-- <el-button 
      type="primary" 
      @click="handleSrceenShare"  
      v-show="openScreenShare" 
      icon="el-icon-video-camera"
      class="icon-camera"
    > 
      录屏
    </el-button> -->
    <el-tooltip class="item" effect="light" content="点击此图标即可开始录屏" placement="left">
      <div @click="handleSrceenShare" v-show="openScreenShare" class="icon-camera">
        <i class="el-icon-video-camera"></i>
      </div>
    </el-tooltip>
    <div v-show="!openScreenShare">
      <div :class="videoWrapperShow ? 'hamburger' : 'hamburger-hid'" @click="toggleHamburger">
        <i class="el-icon-arrow-right" v-show="videoWrapperShow" ></i>
        <i class="el-icon-d-arrow-left icon-24" v-show="!videoWrapperShow"></i>
      </div>
      <div v-if="isScreenShareSupported && isWebRTCSupported" :class="videoWrapperShow ? 'box-show' : 'box-hid'">
        <div v-show="videoWrapperShow" class="web-recorder-box">
          <div class="web-recorder-warpper">
            <span class="web-recoder-rec" v-show="status == 'recording' && screenShow">REC</span>
            <div v-show="screenShow" class="web-recorder-video-box">
              <video ref="screen-share" autoplay class="web-recorder-video" />
            </div>
            <div class="action-group">
              <el-button type="primary" @click="handleStart" v-show="startRecord" size="mini"> 开始新录制 </el-button>
              <el-button  @click="handlePause" v-show="pauseRecord" size="mini"> 暂停 </el-button>
              <el-button type="primary" @click="handleResume" v-show="resumeRecord" size="mini"> 继续</el-button>
              <el-button type="info" @click="hanldeStop" v-show="stopRecord" size="mini"> 完成 </el-button>
              <el-button type="success" @click="handleDownload" v-show="downloadShow" size="mini">下载</el-button>
              <el-button type="danger" @click="handleExit" v-show="exitRecord" size="mini"> 退出 </el-button>
            </div>
          </div>
        </div>
        <div class="handle-btn-bar" v-show="!videoWrapperShow">
          <el-tooltip class="item" effect="light" content="开始新录制" placement="left">
            <div class="el-icon-video-play handle-icon" @click="handleStart" v-show="startRecord"/>
          </el-tooltip>
          <el-tooltip class="item" effect="light" content="暂停录制" placement="left">
            <div class="el-icon-video-pause handle-icon" @click="handlePause" v-show="pauseRecord" ></div>
          </el-tooltip>
          <el-tooltip class="item" effect="light" content="继续录制" placement="left">
             <div class="el-icon-video-play handle-icon" @click="handleResume" v-show="resumeRecord"></div>
          </el-tooltip>
          <el-tooltip class="item" effect="light" content="完成录制" placement="left">
            <div class="el-icon-finished handle-icon" @click="hanldeStop"  v-show="stopRecord" ></div>
          </el-tooltip>
          <el-tooltip class="item" effect="light" content="下载录制的视频" placement="left">
            <div class="el-icon-bottom handle-icon" @click="handleDownload" v-show="downloadShow"></div>
          </el-tooltip>
          <el-tooltip class="item" effect="light" content="退出当前录制" placement="left">
            <div class="el-icon-circle-close handle-icon" @click="handleExit" v-show="exitRecord"></div>
          </el-tooltip>
        </div>
      </div>
    </div>
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
      videoWrapperShow:true
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
      this.handleStart()
    },
    onDataAvailable (e) {
      this.blobs.push(e.data);
    },
    onRecordStopped () {
      const blob = new Blob(this.blobs, { 'type': 'video/webm' });
      this.blobUrl = URL.createObjectURL(blob);
      this.blobs = [];
      
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
      this.downloadShow = true;
      this.$message.error('已停止录制')
    },
    handleDownload () {
      const link = document.createElement('a');
      link.href = this.blobUrl;
      link.download = Date.now();
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
      this.videoWrapperShow = true;
    },
    // 隐藏视屏框
    handleHideSreen(){
      this.screenShow = false;
    },
    toggleHamburger(){
      this.videoWrapperShow = !this.videoWrapperShow;
    }
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
  z-index:999;
  text-align: right;
  float: right;
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
  text-align: right;
  width: 300px;
  z-index:99;
}
.web-recorder-box {
  position: relative;
  box-shadow: 0px 2px 8px 8px rgb(0 0 0 / 8%);
  width:300px;
  margin-left:12px;
  border-radius: 4px;
}
.hamburger{
  position: absolute;
  top: 0;
  left: 0;
  width: 12px;
  height: 42px;
  line-height: 42px;
  text-align: center;
  font-size: 8px;
  color: #fff;
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
  cursor: pointer;
  background: rgba(0,0,0,30%);
  z-index:20;
}
.hamburger-hid {
  position: absolute;
  top: -24%;
  left: 4px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  font-size: 8px;
  color: #fff;
  cursor: pointer;
  background-color:rgba(64,158,255);
  z-index: 20;
  width: 48px;
  border-top-left-radius: 25px;
  border-bottom-left-radius: 19px;
  padding-top:5px;
}
.handle-btn-bar {
  width:40px;
  box-shadow: 0px 2px 8px 8px rgb(0 0 0 / 8%);
  padding-bottom: 5px;
  padding-top: 3px;
}
.handle-icon{
  display: block;
  text-align: center;
  margin: 15px 0;
  font-size: 24px;
  cursor: pointer;
}
.box-show {
  width: 312px;
}
.box-hid {
  width:40px;
  margin-left:12px;
  background-color:rgba(64,158,255,0.9);
  color: white;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}
.icon-camera {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  color: white;
  line-height: 48px;
  font-size: 26px;
  text-align: center;
  background-color:rgba(64,158,255,80%);
  cursor: pointer;
}
.icon-24 {
  font-size: 24px;
}
</style>
