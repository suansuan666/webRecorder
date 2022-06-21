<template>
  <div class="rrweb">
    <div class="btn-bar">
      <el-button type="primary" @click="startRecord">开始录制</el-button>
      <el-button type="success" @click="stopRecord"> 停止录制</el-button>
      <el-button type="danger" @click="replayRecord"> 录制回放</el-button>
    </div>
    <el-form ref="form" :model="form" label-width="80px" class="form">
      <el-form-item label="活动名称">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="活动区域">
        <el-select v-model="form.region" placeholder="请选择活动区域">
          <el-option label="区域一" value="shanghai"></el-option>
          <el-option label="区域二" value="beijing"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="活动时间">
        <el-col :span="11">
          <el-date-picker type="date" placeholder="选择日期" v-model="form.date1" style="width: 100%;"></el-date-picker>
        </el-col>
        <el-col class="line" :span="2">-</el-col>
        <el-col :span="11">
          <el-time-picker placeholder="选择时间" v-model="form.date2" style="width: 100%;"></el-time-picker>
        </el-col>
      </el-form-item>
      <el-form-item label="即时配送">
        <el-switch v-model="form.delivery"></el-switch>
      </el-form-item>
      <el-form-item label="活动性质">
        <el-checkbox-group v-model="form.type">
          <el-checkbox label="美食/餐厅线上活动" name="type"></el-checkbox>
          <el-checkbox label="地推活动" name="type"></el-checkbox>
          <el-checkbox label="线下主题活动" name="type"></el-checkbox>
          <el-checkbox label="单纯品牌曝光" name="type"></el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="特殊资源">
        <el-radio-group v-model="form.resource">
          <el-radio label="线上品牌商赞助"></el-radio>
          <el-radio label="线下场地免费"></el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="活动形式">
        <el-input type="textarea" v-model="form.desc"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">立即创建</el-button>
        <el-button>取消</el-button>
      </el-form-item>
    </el-form>
    <div id="replayVideo" class="video"></div>
  </div>
</template>

<script>
import { record} from 'rrweb'
import rrwebPlayer from 'rrweb-player'
import 'rrweb-player/dist/style.css'
export default {
  name: 'Documentation',
  data() {
    return {
     form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      },
      resource:[]
    }
  },
   mounted () {
    // this.pageRecord();
  },
  methods:{
    onSubmit() {
    //  this.pageRecord();
    },
     // 页面录制
    startRecord(){
      this.$message({
        message: '录制开始',
        type: 'success'
      });
     let tmp = [];
      record({
        emit(e) {
          tmp.push(e)
          console.log(e,tmp,'==e')
        }
      })
      this.resource = tmp;
    },
    // 回放
    replayRecord(){
      const events = this.resource;
      new rrwebPlayer({
        target: document.getElementById('replayVideo'),
        data:{events}
      })
      replayer.play();
    },
    stopRecord(){
      this.$message('录制停止')
      this.startRecord && record({
        emit(e) {
          tmp.push(e)
          console.log(e,tmp,'==e')
        }
      });
    },
    // save 函数用于将 events 发送至后端存入，并重置 events 数组
    saveRecord() {
      const events = this.resource;
      const body = JSON.stringify({ events });
      this.resource = [];
      fetch('http://XXX', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.form {
  width:500px;
  margin:30px;
  float: left;
  margin-right: 60px;
}
.rrweb {
  // display: flex;
}
.video {
  width: 1000px;
  display: flex;
  // height: 500px;
}
</style>
