<template>
  <div class="container-main">
    <div class="container-list">
      <div class="container-buttons">
        <div class="container-list-title">
          <span class="iconfont" style="font-weight: bold">&#xe629;</span>&nbsp;容器列表
        </div>
        <el-button type="primary" size="small" icon="el-icon-plus" @click="addContainer">添加容器</el-button>
        <el-button-group>
          <el-button type="success" size="small" icon="el-icon-switch-button" @click="startContainer">开始</el-button>
          <el-button type="danger" size="small" icon="el-icon-close" @click="stopContainer">停止</el-button>
          <el-button type="danger" size="small" icon="el-icon-delete" @click="deleteContainer">删除</el-button>
        </el-button-group>
      </div>
      <div class="container-search">
        <el-input v-model="input" placeholder="搜索容器" @keyup.enter.native="search">
          <el-select v-model="select" slot="prepend" placeholder="请选择" style="width: 80px">
            <el-option label="名称" value="Name"></el-option>
            <el-option label="状态" value="Status"></el-option>
            <el-option label="镜像" value="Image"></el-option>
          </el-select>
          <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
        </el-input>
      </div>
      <div class="containers">
        <el-table
          :data="containerData"
          stripe
          height="100%"
          style="width: 100%; height: 100%; cursor:pointer !important;"
          @selection-change="handleSelectionChange"
          @row-click="clickRow">
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column
            prop="name"
            label="名称"
            min-width="2">
          </el-table-column>
          <el-table-column
            prop="status"
            label="状态"
            min-width="1">
            <template slot-scope="scope">
              <div slot="reference">
                <el-tag size="medium"
                        :type="scope.row.status === 'running' ? 'success' : (scope.row.status === 'created' ? 'primary' : 'danger')"
                        style="font-weight: bold">{{ scope.row.status }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="image"
            label="镜像"
            min-width="2">
          </el-table-column>
          <el-table-column
            prop="time"
            label="创建时间"
            min-width="2">
          </el-table-column>
          <el-table-column
            prop="port"
            label="端口映射"
            min-width="4">
          </el-table-column>
        </el-table>
      </div>
    </div>
    <el-dialog
      title="创建容器"
      :visible.sync="createContainerDialog"
      width="30%">
      <div style="margin-bottom: 10px">
        <div style="margin-bottom: 5px; font-size: 16px">镜像名称: </div>
        <el-input v-model="imageName" ref="firstInput"></el-input>
      </div>
      <div>
        <div style="margin-bottom: 10px">
          <div style="margin-bottom: 5px; font-size: 16px">镜像版本: </div>
          <el-input v-model="imageTag"></el-input>
        </div>
      </div>
      <div style="margin-bottom: 10px">
        <div style="margin-bottom: 5px; font-size: 16px">内部端口: </div>
        <el-input v-model="innerPort"></el-input>
      </div>
      <div>
        <div style="margin-bottom: 10px">
          <div style="margin-bottom: 5px; font-size: 16px">外部端口: </div>
          <el-input v-model="outerPort"></el-input>
        </div>
      </div>
      <div class="container-create-hint">
        <span class="el-icon-warning" style="margin-right: 10px"></span>
        端口映射可以选择性填写，如不填写则将内部22端口随机映射到某个外部端口
      </div>
      <!--todo: 加个说明-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="createContainerDialog = false">取 消</el-button>
        <el-button type="primary" @click="confirmCreateContainer">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "container",
  data() {
    return {
      input: '',
      select: 'Name',
      /*containerData: [{
        id: '8a64526866017e7ca12568dd70b3f3e59946435ad4f9dab0ba47ae02081c109a',
        name: 'musing_franklin',
        status: 'running',
        image: 'alpine',
        time: '2021-10-21 10:05:07',
        ip: '172.17.0.2',
        port: '49154:8080',
      }],*/
      containerData: [],
      multipleSelection: [],
      createContainerDialog: false,
      imageName: '',
      imageTag: 'latest',
      innerPort: '',
      outerPort: '',
    }
  },
  mounted() {
    this.apply_for_info();
  },
  methods: {
    apply_for_info() {
      this.ajax.get(
        '/ctn/list',
        {},
        this,
        {
          success: function (res) {
            if (res.status === 0) {
              this.containerData = [];
              for (let container_id of res.ctn_ids) {
                let container_detail = this.get_info_for_container_id(container_id);
                if (Object.keys(container_detail).length !== 0) {
                  let ret = '';
                  const ports = container_detail.Port
                  for (let outer in ports) {
                    ret += ports[outer] + ':' + outer + ', ';
                  }
                  this.containerData.push({
                    id: container_detail.Id,
                    name: container_detail.Name,
                    image: container_detail.Image,
                    port: ret.substring(0, ret.length - 2),
                    status: container_detail.Status,
                    time: container_detail.Created.substring(0, 10) + ' ' + container_detail.Created.substring(11, 19),
                  });
                }
              }
              this.containerData.sort(function (a, b) {
                if (a['time'] > b['time']) {
                  return -1;
                } else {
                  return 1;
                }
              });
            } else {
              this.alert_msg.error('拉取容器列表失败');
            }
          },
        }
      );
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
    search() {
      if (this.input === '') {
        this.apply_for_info();
      } else {
        this.ajax.get(
          '/ctn/search',
          {keyword: this.input, key: this.select},
          this,
          {
            success: function (res) {
              if (res.status === 0) {
                this.containerData = [];
                for (let container_id of res.ctn_ids) {
                  let container_detail = this.get_info_for_container_id(container_id);
                  if (Object.keys(container_detail).length !== 0) {
                    let ret = '';
                    const ports = container_detail.Port
                    for (let outer in ports) {
                      ret += ports[outer] + ':' + outer + ', ';
                    }
                    this.containerData.push({
                      id: container_detail.Id,
                      name: container_detail.Name,
                      image: container_detail.Image,
                      port: ret.substring(0, ret.length - 2),
                      status: container_detail.Status,
                      time: container_detail.Created.substring(0, 10) + ' ' + container_detail.Created.substring(11, 19),
                    });
                  }
                }
                this.containerData.sort(function (a, b) {
                  if (a['time'] > b['time']) {
                    return -1;
                  } else {
                    return 1;
                  }
                });
              } else {
                this.alert_msg.error('拉取容器列表失败');
              }
            },
          }
        );
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    clickRow(row) {
      this.$router.push({
        name: '容器详情',
        query: {
          id: row.id,
        }});
    },
    addContainer() {
      this.createContainerDialog = true;
      const that = this;
      setTimeout(function () {
        that.$refs.firstInput.focus();
      }, 0);
    },
    confirmCreateContainer() {
      this.createContainerDialog = false;
      const notice = this.$notify({
        title: '创建容器',
        message: '正在使用镜像 ' + this.imageName + ':' + this.imageTag + ' 创建容器',
        duration: 0,
      })
      this.ajax.get(
        '/ctn/create',
        {im: this.imageName + ':' + this.imageTag, inner_port: this.innerPort, outer_port: this.outerPort},
        this,
        {
          success (res) {
            if (res.status === 0) {
              this.alert_msg.success('创建容器成功');
              const container_detail = this.get_info_for_container_id(res.Id);
              if (Object.keys(container_detail).length !== 0) {
                let ret = '';
                const ports = container_detail.Port
                for (let outer in ports) {
                  ret += ports[outer] + ':' + outer + ', ';
                }
                this.containerData.push({
                  id: container_detail.Id,
                  name: container_detail.Name,
                  image: container_detail.Image,
                  port: ret.substring(0, ret.length - 2),
                  status: container_detail.Status,
                  time: container_detail.Created.substring(0, 10) + ' ' + container_detail.Created.substring(11, 19),
                });
                this.containerData.sort(function (a, b) {
                  if (a['time'] > b['time']) {
                    return -1;
                  } else {
                    return 1;
                  }
                });
              }
            } else {
              this.alert_msg.error('创建容器失败');
            }
            notice.close();
          },
          error() {
            this.alert_msg.error('创建容器失败');
            notice.close();
          }
        },
      );
    },
    startContainer() {
      if (this.multipleSelection.length !== 0) {
        const that = this;
        this.$confirm('是否启动这些容器?', '启动容器', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          for (let container of that.multipleSelection) {
            that.ajax.get(
              '/ctn/start',
              {ctn_id: container.id},
              that,
              {
                success (res) {
                  if (res.status === 0) {
                    for (let i = 0; i < that.containerData.length; i++){
                      if (that.containerData[i].id === container.id) {
                        that.containerData[i].status = 'running';
                        break;
                      }
                    }
                  } else {
                    that.alert_msg.error('启动镜像' + container.name + '失败');
                  }
                },
                error() {
                  that.alert_msg.error('启动镜像' + container.name + '失败');
                }
              },
              {async: false}
            );
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消启动'
          });
        });
      }
    },
    stopContainer() {
      if (this.multipleSelection.length !== 0) {
        const that = this;
        this.$confirm('是否停止这些容器?', '停止容器', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          for (let container of that.multipleSelection) {
            that.ajax.get(
              '/ctn/stop',
              {ctn_id: container.id},
              that,
              {
                success (res) {
                  if (res.status === 0) {
                    for (let i = 0; i < that.containerData.length; i++){
                      if (that.containerData[i].id === container.id) {
                        that.containerData[i].status = 'exited';
                        break;
                      }
                    }
                  } else {
                    that.alert_msg.error('停止镜像' + container.name + '失败');
                  }
                },
                error() {
                  that.alert_msg.error('停止镜像' + container.name + '失败');
                }
              },
              {async: false}
            );
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消停止'
          });
        });
      }
    },
    deleteContainer() {
      if (this.multipleSelection.length !== 0) {
        const that = this;
        this.$confirm('是否删除这些容器?', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          for (let container of that.multipleSelection) {
            that.ajax.get(
              '/ctn/remove',
              {ctn_id: container.id},
              that,
              {
                success (res) {
                  if (res.status === 0) {
                    for (let i = 0; i < that.containerData.length; i++){
                      if (that.containerData[i].id === container.id) {
                        that.containerData.splice(i, 1);
                        break;
                      }
                    }
                  } else {
                    that.alert_msg.error('删除镜像' + container.name + '失败');
                  }
                },
                error() {
                  that.alert_msg.error('删除镜像' + container.name + '失败');
                }
              },
              {async: false}
            );
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      }
    },
  }
}
</script>

<style scoped>

.container-main {
  height: calc(100% - 80px);
}

.container-header {
  border-bottom: solid 1.5px rgba(140, 147, 157, 0.5);
}

.container-list {
  width: 98%;
  height: 100%;
  margin-top: 30px;
  margin-left: 1%;
  border: solid 1px rgba(140, 147, 157, 0.5);
  border-radius: 4px;
  background-color: rgba(50, 50, 50, 0.02);
}

.container-buttons {
  height: 50px;
  padding-right: 10px;
  /*border-bottom: solid 1px rgba(140, 147, 157, 0.5);*/
}

.container-buttons .el-button-group {
  margin-top: 10px;
  margin-left: 10px;
  float: right;
}

.container-buttons > .el-button {
  margin-top: 10px;
  margin-left: 10px;
  float: right;
}

.container-list-title  {
  margin-left: 20px;
  margin-top: 16px;
  font-size: 16px;
  color: #6a6a6a;
  float: left
}

.containers {
  height: calc(100% - 90px);
  border-bottom: solid 1px rgba(140, 147, 157, 0.5);
  border-radius: 4px;
}

.container-create-hint {
  color: goldenrod;
  margin-top: 10px;
}

</style>
