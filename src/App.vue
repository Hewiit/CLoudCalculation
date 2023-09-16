<template>
  <div id="app">
    <el-container style="height: 100%">
      <el-aside style="width: 255px;">
        <Nav/>
      </el-aside>
      <el-container>
        <el-header>
          <NavTop/>
        </el-header>
        <el-main>
          <router-view/>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import Nav from './components/nav';
import NavTop from "./components/nav-top";

window.onload = function () {
  $('#app').css('opacity', '1');
}

export default {
  name: 'App',

  components: {
    NavTop,
    Nav
  },

  methods: {}
}
</script>

<style>
	@import url("./assets/var.css");
    @import url("./assets/common.css");
    @import url("./assets/iconfont/iconfont.css");

	body {
		margin:0;
		padding:0;
	}

	#app {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		min-width: 1320px;
		height: 100%;
		opacity: 0;
		font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
		transition: opacity 0.6s linear;
		overflow: overlay;
	}

  .el-header {
    height: 80px!important;
    border-bottom: solid 1.5px rgba(140, 147, 157, 0.5);
  }

</style>
