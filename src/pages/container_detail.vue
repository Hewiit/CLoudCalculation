<template>
  <div class="container-detail-main">
    <el-card class="container-card">
      <template #header>
        <div class="card-header">
          <span class="iconfont" style="font-weight: bold">&#xe629;</span>
          <span slot="title" class="card-title">容器详情</span>
        </div>
      </template>
      <div class="container-detail-card">
        <detail_row
          v-for="(r, index) in detail_list"
          :key="index"
          :title="r.title"
          :content="r.content">
        </detail_row>
      </div>
      <el-button type="success" icon="el-icon-switch-button" size="small" @click="startContainer">启动容器</el-button>
      <el-button type="danger" icon="el-icon-close" size="small" @click="stopContainer">停止容器</el-button>
      <el-button type="danger" icon="el-icon-delete" size="small" @click="deleteContainer">删除容器</el-button>
    </el-card>
    <el-card class="container-card">
      <template #header>
        <div class="card-header">
          <span class="iconfont" style="font-weight: bold">&#xe636;</span>
          <span slot="title" class="card-title">在容器内执行命令</span>
        </div>
      </template>
      <div class="container-exec">
        <el-input placeholder="请输入命令" v-model="command" @keyup.enter.native="dockerExec">
          <el-button slot="append" icon="el-icon-right" @click="dockerExec"></el-button>
          <el-button slot="append" icon="el-icon-refresh" @click="clearWindow"></el-button>
        </el-input>
        <div class="container-exec-window" ref="execWindow">
          <div
            v-for="(cmd, index) in exec"
            :key="index"
            style="word-wrap:break-word;">
            {{ cmd }}
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import detail_row from "@/components/detail_row";
export default {
  name: "container_detail",
  components: {
    detail_row
  },
  data() {
    return {
      id: this.$route.query.id,
      detail_list: [{
          title: "名称",
          content: "",
        }, {
          title: "id",
          content: ""
        }, {
          title: "端口映射",
          content: ""
        }, {
          title: "运行镜像",
          content: ""
        }, {
          title: "状态",
          content: ""
        }, {
          title: "创建时间",
          content: ""
        }
      ],
      command: '',
      exec: []
    }
  },
  mounted() {
    this.apply_for_info();
  },
  methods: {
    apply_for_info() {
      const container_detail = this.get_info_for_container_id(this.id);
      if (Object.keys(container_detail).length !== 0) {
        let ret = '';
        const ports = container_detail.Port
        for (let outer in ports) {
          ret += ports[outer] + ':' + outer + ', ';
        }
        this.detail_list[1].content = container_detail.Id;
        this.detail_list[0].content = container_detail.Name;
        this.detail_list[3].content = container_detail.Image;
        this.detail_list[2].content = ret.substring(0, ret.length - 2);
        this.detail_list[4].content = container_detail.Status;
        this.detail_list[5].content = container_detail.Created.substring(0, 10) + ' ' + container_detail.Created.substring(11, 19);

      }
    },
    get_info_for_container_id(container_id) {
      let ret = {};
      this.ajax.get(
        '/ctn/get',
        {ctn_id: container_id},
        this,
        {
          success (res) {
            if (res.status === 0) {
              ret = res;
            }
          },
        },
        {async: false}
      );
      return ret;
    },
    startContainer() {
      const that = this;
      this.$confirm('是否启动容器?', '启动容器', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        that.ajax.get(
          '/ctn/start',
          {ctn_id: this.id},
          that,
          {
            success (res) {
              if (res.status === 0) {
                that.detail_list[4].content = 'running';
                that.alert_msg.success('启动成功');
              } else {
                that.alert_msg.error('启动镜像失败');
              }
            },
            error() {
              that.alert_msg.error('启动镜像失败');
            }
          }
        );
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消启动'
        });
      });
    },
    stopContainer() {
      const that = this;
      this.$confirm('是否停止容器?', '停止容器', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        that.ajax.get(
          '/ctn/stop',
          {ctn_id: this.id},
          that,
          {
            success (res) {
              if (res.status === 0) {
                that.detail_list[4].content = 'exited';
                that.alert_msg.success('停止成功');
              } else {
                that.alert_msg.error('停止镜像失败');
              }
            },
            error() {
              that.alert_msg.error('停止镜像失败');
            }
          }
        );
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消停止'
        });
      });
    },
    deleteContainer() {
      const that = this;
      this.$confirm('是否删除容器?', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        that.ajax.get(
          '/ctn/remove',
          {ctn_id: this.id},
          that,
          {
            success (res) {
              if (res.status === 0) {
                that.alert_msg.success('删除成功');
                that.$router.push({name: '容器管理'});
              } else {
                that.alert_msg.error('删除镜像失败');
              }
            },
            error() {
              that.alert_msg.error('删除镜像失败');
            }
          }
        );
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    dockerExec() {
      if (this.command !== '') {
        this.exec.push('> ' + this.command);
        const command_copy = this.command;
        this.command = '';
        this.ajax.get(
          '/ctn/exec',
          {ctn_id: this.id, command: command_copy},
          this,
          {
            success (res) {
              if (res.status === 0) {
                const rets = res.output.split(/\n/g);
                for (let line of rets) {
                  this.exec.push(line);
                }
              } else {
                this.exec.push('Something is wrong. Please retry.');
              }
            },
            error() {
              this.exec.push('The network is unstable. Please retry.');
            }
          },
          {async: false}
        );
        const that = this;
        setTimeout(function() {
          const ew = that.$refs.execWindow;
          ew.scrollTop = ew.scrollHeight;
        }, 0);
      }
    },
    clearWindow() {
      this.exec = [];
    }
  }
}
</script>

<style scoped>

.container-card {
  margin-bottom: 20px;
  padding-bottom: 10px;
}

.container-detail-card {
  margin-bottom: 30px;
}

.container-tag {
  float: left;
  margin: 0 10px 20px 0;
}

.card-title {
  margin-left: 5px;
}

.el-card >>> .el-card__header {
  padding: 15px 20px !important;
  background-color: #f6f6f6;
}

.card-header {
  font-size: 16px;
}

.container-exec-window {
  margin-top: 10px;
  height: 500px;
  overflow: scroll;
  border: solid 2px rgba(140, 147, 157, 0.5);;
  border-radius: 2px;
  padding: 10px;
  background-color: black;
  color: white;
  font-family: Menlo,serif;
}

</style>
