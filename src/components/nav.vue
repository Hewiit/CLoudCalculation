<template>
  <div class="nav-main">
    <div class="nav-logo">
      <el-image :src="require('../assets/logo.png')"></el-image>
      <p class="nav-name">PaaS云平台</p>
    </div>
    <el-menu
      default-active=""
      @select="open">
      <el-menu-item index="1">
        <span class="iconfont">&#xe60e;</span>
        <span slot="title" class="nav-subtitle">镜像管理</span>
      </el-menu-item>
      <el-menu-item index="2">
        <span class="iconfont" style="font-weight: bold">&#xe629;</span>
        <span slot="title" class="nav-subtitle">容器管理</span>
      </el-menu-item>
      <el-menu-item index="3">
        <span class="iconfont">&#xf0174;</span>
        <span slot="title" class="nav-subtitle">应用部署</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script>
export default {
  name: "nav",
  data() {
    return {

    }
  },
  methods: {
    open(index, indexPath) {
      if (index === "1") {
        this.$router.push({name: '镜像管理'});
      } else if (index === "2") {
        this.$router.push({name: '容器管理'});
      } else if (index === "3") {
        this.$router.push({name: '应用部署'});
      }
    }
  }
}
</script>

<style scoped>

.nav-main {
  border-right: solid 2px rgba(140, 147, 157, 0.5);
  height: 100%;
}

.nav-logo {
  height: 110px;
  padding-left: 10%;
}

.nav-logo .el-image {
  width: 20%;
  margin-top: 30px;
  float: left;
}

.nav-name {
  font-size: 25px;
  width: 60%;
  margin-top: 35px;
  margin-left: 10px;
  float: left;
}

.nav-main .el-menu {
  border: none;
}

.el-menu-item {
  font-size: 16px;
}

.iconfont {
  font-size: 18px;
  margin-left: 5px;
}

.nav-subtitle {
  margin-left: 10px;
}

</style>
