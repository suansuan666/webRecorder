const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave:false, // 关闭eslint校验
  css:{
    extract: false // css与js不分开打包
  }
})
