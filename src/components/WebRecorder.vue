<template>
  <div class="web-recorder-wrapper">
    <vue-draggable-resizable  
      @dragging="onDragging" 
      :parent="true" 
      class="drag-wrapper" 
      :w="initWidth" 
      :h="initHeight" 
      :x="initXPostion" 
      :y="initYPostion"
      :z="999"
    >
      <div class="web-recorder">
        <el-tooltip class="item" effect="light" content="点击此图标可录屏哦" placement="left" :disabled="toolTipHidden" >
          <div 
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove" 
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
            @click="handleSrceenShare" 
            v-show="openScreenShare" 
            class="icon-camera"
          >
            <img src="../assets/recorder.png" class="imgs">
          </div>
        </el-tooltip>
        <div v-show="!openScreenShare">
          <div :class="videoWrapperShow ? 'hamburger' : ''" @click="toggleHamburger">
            <i class="el-icon-arrow-right" v-show="videoWrapperShow" ></i>
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
                  <el-button type="primary" @click="hanldeStop" v-show="stopRecord" size="mini"> 完成 </el-button>
                  <el-button type="success" @click="handleDownload" v-show="downloadShow" size="mini">下载</el-button>
                  <el-button type="danger" @click="handleExit" v-show="exitRecord" size="mini"> 退出 </el-button>
                </div>
              </div>
            </div>
            <div class="handle-btn-bar" v-show="!videoWrapperShow">
              <el-tooltip class="item" effect="light" content="展开小屏" placement="left">
                <div class="el-icon-d-arrow-left hamburger-hid" @click="toggleHamburger"></div>
              </el-tooltip>
              <el-tooltip class="item" effect="light" content="开始新录制" placement="left">
                <div class="el-icon-exit-solid handle-icon" @click="handleStart" v-show="startRecord"></div>
              </el-tooltip>
              <el-tooltip class="item" effect="light" content="暂停录制" placement="left">
                <div class="el-icon-caret-right handle-icon" @click="handlePause" v-show="pauseRecord" ></div>
              </el-tooltip>
              <el-tooltip class="item" effect="light" content="继续录制" placement="left">
                <div class="el-icon-document handle-icon" @click="handleResume" v-show="resumeRecord"></div>
              </el-tooltip>
              <el-tooltip class="item" effect="light" content="完成录制" placement="left">
                <div class="el-icon-circle-check handle-icon" @click="hanldeStop"  v-show="stopRecord"></div>
              </el-tooltip>
              <el-tooltip class="item" effect="light" content="下载录制的视频" placement="left">
                <div class="el-icon-download handle-icon" @click="handleDownload" v-show="downloadShow"></div>
              </el-tooltip>
              <el-tooltip class="item" effect="light" content="退出当前录制" placement="left">
                <div class="el-icon-storage handle-icon" @click="handleExit" v-show="exitRecord"></div>
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>
     
    </vue-draggable-resizable>
   
    <!-- 兜底提示框 -->
    <el-dialog
      title="提示"
      :visible.sync="centerDialogVisible"
      :modal-append-to-body="false"
      width="30%"
      center>
      <span class="center-dialog-title">当前环境暂无法使用，您可通过完成以下配置在Chrome浏览器中进行使用</span>
      <el-steps :active="stepNum" finish-status="success" class="step">
        <el-step title="步骤 1"></el-step>
        <el-step title="步骤 2"></el-step>
        <el-step title="步骤 3"></el-step>
      </el-steps>
      <div class="step-content">
        <div v-show="stepNum === 0" class="content">
          <h4>1、复制：chrome://flags/#unsafely-treat-insecure-origin-as-secure</h4>
          <h4>2、打开浏览器并将上述地址输入至地址栏</h4>
          <div class="pic">
            <img src="../assets/step-1.png">
          </div>
        </div>
        <div v-show="stepNum === 1" class="content">
          <h4 class="mr-0">1、将当前域名：<span class="blue">{{ hostname }}</span> 填入以下位置</h4> 
          <h4 class="mr-0">2、将按钮切换成<el-button type="text"> Enable</el-button>状态</h4>
          <div class="pic">
            <img src="../assets/step-2.png"/>
          </div>
        </div>
        <div v-show="stepNum === 2" class="content">
          <h4> 点击底部Relaunch按钮即可生效</h4>
          <div class="pic">
            <img src="../assets/step-3.png"/>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer" v-if="stepNum < 2">
        <el-button type="primary" @click="last" v-if="stepNum === 1">上一步</el-button>
        <el-button type="primary" @click="next">下一步</el-button>
      </span>
      <span slot="footer" class="dialog-footer" v-if="stepNum === 2">
        <el-button type="primary" @click="last">上一步</el-button>
        <el-button type="primary" @click="centerDialogVisible = false">知道了</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import VueDraggableResizable from 'vue-draggable-resizable'
import { throttle } from 'lodash'
export default {
  name:'webRecorder',
  components: {
    VueDraggableResizable,
  },
  props:{
    initWidth:{
      type:Number,
      default:100,
    },
    initHeight:{
      type:Number,
      default:150,
    },
    initYPostion:{
      type:Number,
      default:400,
    }
  },
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
      videoWrapperShow:true,
      centerDialogVisible:false,
      stepNum: 0,
      hostname:'',
      isDrag:false,
      toolTipHidden:false,
      initXPostion:0
    }
  },
  created(){
    if(navigator && navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      this.isScreenShareSupported = true
    }
    if(navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      this.isWebRTCSupported = true
    }
    this.hostname = window.location.origin;
    
  },
   mounted () {
    this.screenShareVideoElement = this.$refs['screen-share'];
    this.initXPostion = document.body.clientWidth - 10;
  },

  methods:{
    async handleSrceenShare(){
      // mediaDevices.getUserMedia() 信息流捕获 参数里可以去指定媒体类型
      // const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // mediaDevices.getDisplayMedia()屏幕捕获  用户选择和授权展示的窗口
      if(this.isDrag) {
        return false
      }
      try{
        this.localScreenShareStream = await navigator.mediaDevices.getDisplayMedia().catch(e => console.log('取消授权'))
      } catch(e){
        this.stepNum = 0;
        this.centerDialogVisible = true;
      }
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
    },
    next(){
      this.stepNum++ ;
      if(this.stepNum > 2) {
        this.stepNum = 0
      }
    },
    last(){
      this.stepNum --;
    },
    handleMouseDown(){
      this.isDrag = false;
    },
    handleMouseMove(){
      this.isDrag = true;
    },
    onDragging(){
      this.toolTipHidden = true
    },
    handleMouseEnter: throttle(function(){
      this.toolTipHidden = false
    },300),
    handleMouseLeave: throttle(function(){
      this.toolTipHidden = true;
    },300),
  }
}
</script>

<style scoped>
.web-recorder-wrapper {
  height: 100%;
  width: 100%;
  position: fixed;
  left: 0;
  top: 0;
  pointer-events: none;
  z-index:99999;
}
.web-recorder {
  position: absolute;
  bottom:0;
  right:10px;
  pointer-events: auto;
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
  background-color:rgba(64,158,255);
  font-size: 24px;
  height: 36px;
  width: 100%;
  text-align: center;
  line-height: 36px;
  border-top-left-radius: 4px;
  cursor: pointer;
}
.handle-btn-bar {
  width:40px;
  box-shadow: 0px 2px 8px 8px rgb(0 0 0 / 8%);
  padding-bottom: 5px;
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
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}
.icon-camera {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 26px;
  background-color:rgba(64,158,255,80%);
  cursor: pointer;
}
.icon-24 {
  font-size: 24px;
}
.step-content{
  display: flex;
  justify-content: space-between;
  align-items: center
}
.arrow-icon {
  font-size: 24px;
  cursor: pointer;
}
.step {
  margin:20px 0;
}
.step-content h4{
  text-align: left;
  /* margin-bottom: 0; */
}
img {
  width:100%;
  height:100%;
}
.el-dialog__wrapper {
  z-index: 30000 !important;
  pointer-events: auto;
}

.blue {
  color:#409EFF;
}
.mr-0 {
  margin:0;
}
.imgs {
  width:30px;
  height:30px;
}
</style>
<style>
.center-dialog-title{
  text-align: center
}
</style>

