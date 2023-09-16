<template>
  <div class="service-main">
    <div class="service-list">
      <div class="service-buttons">
        <div class="service-list-title">
          <span class="iconfont">&#xf0174;</span>&nbsp;
          <span style="font-weight: bold">{{ this.$route.query.name }}</span>
          的服务列表
        </div>
        <el-button type="danger" size="small" @click="deleteCurApplication">删除{{ this.$route.query.name }}</el-button>
        <el-button type="danger" size="small" @click="deleteService">删除服务</el-button>
        <el-button type="primary" size="small" @click="createService">创建服务</el-button>
        <div style="float: right">
          <el-tag :type="this.$route.query.status === '0' ? 'success' : 'warning'"
                  style="font-weight: bold; margin-top: 10px">
            {{ this.$route.query.status === '0' ? 'Active' : 'Terminating' }}
          </el-tag>
        </div>
      </div>
      <div class="service-search">
        <el-input v-model="input" placeholder="搜索服务"  @keyup.enter.native="search">
          <el-select v-model="select" slot="prepend" placeholder="请选择" style="width: 80px">
            <el-option label="名称" value="1"></el-option>
          </el-select>
          <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
        </el-input>
      </div>
      <div class="services">
        <el-table
          :data="serviceData"
          stripe
          height="100%"
          style="width: 100%; height: 100%;"
          @selection-change="handleSelectionChange">
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
            prop="type"
            label="类型"
            min-width="2">
          </el-table-column>
          <el-table-column
            prop="cluster_ip"
            label="集群ip地址"
            min-width="2">
          </el-table-column>
          <el-table-column
            prop="port"
            label="端口映射"
            min-width="2">
          </el-table-column>
          <el-table-column
            prop="create_time"
            label="创建时间"
            min-width="2">
          </el-table-column>
        </el-table>
      </div>
    </div>
    <el-dialog
      title="创建服务"
      :visible.sync="createServiceDialog"
      width="30%">
      <div>
        <div style="margin-bottom: 10px">
          <div style="margin-bottom: 5px; font-size: 16px">服务名称: </div>
          <el-input v-model="createServiceName" ref="firstInput"></el-input>
        </div>
      </div>
      <div style="margin-bottom: 10px">
        <div style="margin-bottom: 5px; font-size: 16px">选择镜像: </div>
        <el-select v-model="createServiceImage" placeholder="请选择" style="width: 100%">
          <el-option
            v-for="item in services"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createServiceDialog = false">取 消</el-button>
        <el-button type="primary" @click="confirmCreateService">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "service_detail",
  data() {
    return {
      input: '',
      select: '1',
      serviceData: [],
      multipleSelection: [],
      createServiceDialog: false,
      createServiceName: '',
      createServiceImage: '',
      creating: false,
      services: [{
        value: 'nginx',
        label: 'nginx',
      }, {
        value: 'maven',
        label: 'maven'
      }, {
        value: 'mysql',
        label: 'mysql'
      }, {
        value: 'python',
        label: 'python'
      }, {
        value: 'rabbitmq',
        label: 'rabbitmq'
      }, {
        value: 'redis',
        label: 'redis'
      }, {
        value: 'tomcat',
        label: 'tomcat'
      }, {
        value: 'zookeeper',
        label: 'zookeeper'
      }, {
        value: 'openjdk',
        label: 'openjdk'
      }, {
        value: 'mongo',
        label: 'mongo'
      }],
    }
  },
  mounted() {
    this.apply_for_info();
  },
  methods: {
    apply_for_info() {
      this.ajax.get(
        '/app/svcs',
        {app_name: this.$route.query.name},
        this,
        {
          success: function (res) {
            this.serviceData = res;
            for (let i = 0; i < this.serviceData.length; i++) {
              this.serviceData[i].create_time = this.serviceData[i].create_time.substring(0, 19);
            }
            this.serviceData.sort(function (a, b) {
              if (a['create_time'] > b['create_time']) {
                return -1;
              } else {
                return 1;
              }
            });
          },
          error() {
            this.alert_msg.error('拉取服务列表失败');
          }
        }
      );
    },
    search() {
      if (this.input === '') {
        this.apply_for_info();
      } else {
        this.ajax.get(
          '/app/search/svc',
          {app_name: this.$route.query.name, key: this.input},
          this,
          {
            success: function (res) {
              this.serviceData = res;
              for (let i = 0; i < this.serviceData.length; i++) {
                this.serviceData[i].create_time = this.serviceData[i].create_time.substring(0, 19);
              }
              this.serviceData.sort(function (a, b) {
                if (a['create_time'] > b['create_time']) {
                  return -1;
                } else {
                  return 1;
                }
              });
            },
            error() {
              this.alert_msg.error('拉取服务列表失败');
            }
          }
        );
      }
    },
    deleteCurApplication() {
      const that = this;
      this.$confirm('是否删除' + that.$route.query.name + '?', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        that.ajax.get(
          '/app/delete',
          {app_name: that.$route.query.name},
          that,
          {
            success (res) {
              if (res.msg === 'success') {
                that.alert_msg.success('删除成功');
                that.$router.push({name: '应用部署'});
              } else {
                that.alert_msg.error('删除' + that.$route.query.name + '失败');
              }
            },
            error() {
              that.alert_msg.error('删除' + that.$route.query.name + '失败');
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
    deleteService() {
      if (this.multipleSelection.length !== 0) {
        const that = this;
        this.$confirm('是否删除这些服务?', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          for (let service of that.multipleSelection) {
            that.ajax.get(
              '/app/delete_svc',
              {app_name: this.$route.query.name, svc_name: service.name},
              that,
              {
                success (res) {
                  if (res.msg === 'success') {
                    for (let i = 0; i < that.serviceData.length; i++){
                      if (that.serviceData[i].name === service.name) {
                        that.serviceData.splice(i, 1);
                        break;
                      }
                    }
                  } else {
                    that.alert_msg.error('删除服务' + service.name + '失败');
                  }
                },
                error() {
                  that.alert_msg.error('删除服务' + service.name + '失败');
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
    get_info_for_service_name(name) {
      let ret;
      this.ajax.get(
        '/app/svcs',
        {app_name: this.$route.query.name},
        this,
        {
          success: function (res) {
            ret = res;
          },
        },
        {async: false}
      );
      for (let it of ret) {
        if (it.name === name) {
          return it;
        }
      }
    },
    createService() {
      this.createServiceDialog = true;
      const that = this;
      setTimeout(function () {
        that.$refs.firstInput.focus();
      }, 0);
    },
    confirmCreateService() {
      this.createServiceDialog = false;
      const imageCopy = this.createServiceImage, nameCopy = this.createServiceName;
      const notice = this.$notify({
        title: '创建服务',
        message: '正在使用镜像' + imageCopy + '创建服务' + nameCopy,
        duration: 0,
      });
      this.createServiceName = '';
      this.createServiceImage = '';
      this.ajax.get(
        '/app/create_svc',
        {app_name: this.$route.query.name, svc_name: nameCopy, img_name: imageCopy},
        this,
        {
          success (res) {
            if (res.msg === 'success') {
              this.alert_msg.success('创建应用成功');
              const service_detail = this.get_info_for_service_name(nameCopy);
              if (Object.keys(service_detail).length !== 0) {
                service_detail.create_time = service_detail.create_time.substring(0, 19);
                this.serviceData.push(service_detail);
                this.serviceData.sort(function (a, b) {
                  if (a['create_time'] > b['create_time']) {
                    return -1;
                  } else {
                    return 1;
                  }
                });
              }
            } else {
              this.alert_msg.error('创建应用失败');
            }
            notice.close();
          },
          error() {
            this.alert_msg.error('创建应用失败');
            notice.close();
          }
        },
      );
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
  }
}
</script>

<style scoped>

.service-main {
  height: calc(100% - 80px);
}

.service-list {
  width: 98%;
  height: 100%;
  margin-top: 30px;
  margin-left: 1%;
  border: solid 1px rgba(140, 147, 157, 0.5);
  border-radius: 4px;
  background-color: rgba(50, 50, 50, 0.02);
}

.service-buttons {
  height: 50px;
  padding-right: 10px;
  /*border-bottom: solid 1px rgba(140, 147, 157, 0.5);*/
}

.service-buttons .el-button {
  margin-top: 10px;
  margin-left: 10px;
  float: right;
}

.service-list-title  {
  margin-left: 20px;
  margin-top: 16px;
  font-size: 16px;
  color: #6a6a6a;
  float: left
}

.services {
  height: calc(100% - 90px);
  border-bottom: solid 1px rgba(140, 147, 157, 0.5);
  border-radius: 4px;
}

</style>
