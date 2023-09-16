<template>
  <div class="application-main">
    <div class="application-list">
      <div class="application-buttons">
        <div class="application-list-title">
          <span class="iconfont">&#xf0174;</span>&nbsp;应用列表</div>
        <el-button type="danger" size="small" @click="deleteApplication">删除应用</el-button>
        <el-button type="primary" size="small" @click="createApplication">创建应用</el-button>
      </div>
      <div class="application-search">
        <el-input v-model="input" placeholder="搜索应用" @keyup.enter.native="search">
          <el-select v-model="select" slot="prepend" placeholder="请选择" style="width: 80px">
            <el-option label="名称" value="1"></el-option>>
          </el-select>
          <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
        </el-input>
      </div>
      <div class="applications">
        <el-table
          :data="applicationData"
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
            prop="created_time"
            label="创建时间"
            min-width="2">
          </el-table-column>
          <el-table-column
            prop="status"
            label="状态"
            min-width="1">
            <template slot-scope="scope">
              <div slot="reference">
                <el-tag size="medium"
                        :type="scope.row.status === 'Active' ? 'success' : 'warning'"
                        style="font-weight: bold">
                  {{ scope.row.status }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <el-dialog
      title="创建应用"
      :visible.sync="createApplicationDialog"
      width="30%">
      <div style="margin-bottom: 10px">
        <div style="margin-bottom: 5px; font-size: 16px">应用名称: </div>
        <el-input v-model="createApplicationName" ref="firstInput"></el-input>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createApplicationDialog = false">取 消</el-button>
        <el-button type="primary" @click="confirmCreateApplication">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "service",
  data() {
    return {
      input: '',
      select: '1',
      applicationData: [],
      multipleSelection: [],
      createApplicationDialog: false,
      createApplicationName: '',
      creating: false,
    }
  },
  mounted() {
    this.apply_for_info();
  },
  methods: {
    apply_for_info() {
      this.ajax.get(
        '/app/all',
        {},
        this,
        {
          success: function (res) {
            this.applicationData = res;
            for (let i = 0; i < this.applicationData.length; i++) {
              this.applicationData[i].created_time = this.applicationData[i].created_time.substring(0, 19)
            }
            this.applicationData.sort(function (a, b) {
              if (a['created_time'] > b['created_time']) {
                return -1;
              } else {
                return 1;
              }
            });
          },
          error() {
            this.alert_msg.error('拉取应用列表失败');
          }
        }
      );
    },
    search() {
      if (this.input === '') {
        this.apply_for_info();
      } else {
        this.ajax.get(
          '/app/search',
          {key: this.input},
          this,
          {
            success: function (res) {
              this.applicationData = res;
              for (let i = 0; i < this.applicationData.length; i++) {
                this.applicationData[i].created_time = this.applicationData[i].created_time.substring(0, 19)
              }
              this.applicationData.sort(function (a, b) {
                if (a['created_time'] > b['created_time']) {
                  return -1;
                } else {
                  return 1;
                }
              });
            },
            error() {
              this.alert_msg.error('拉取应用列表失败');
            }
          }
        );
      }
    },
    deleteApplication() {
      if (this.multipleSelection.length !== 0) {
        const that = this;
        this.$confirm('是否删除这些容器?', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          for (let application of that.multipleSelection) {
            that.ajax.get(
              '/app/delete',
              {app_name: application.name},
              that,
              {
                success (res) {
                  if (res.msg === 'success') {
                    for (let i = 0; i < that.applicationData.length; i++){
                      if (that.applicationData[i].name === application.name) {
                        that.applicationData.splice(i, 1);
                        break;
                      }
                    }
                  } else {
                    that.alert_msg.error('删除应用' + application.name + '失败');
                  }
                },
                error() {
                  that.alert_msg.error('删除应用' + application.name + '失败');
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
    createApplication() {
      this.createApplicationDialog = true;
      const that = this;
      setTimeout(function () {
        that.$refs.firstInput.focus();
      }, 0);
    },
    get_info_for_application_name(name) {
      let ret;
      this.ajax.get(
        '/app/all',
        {},
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
    confirmCreateApplication() {
      this.createApplicationDialog = false;
      this.createContainerDialog = false;
      const notice = this.$notify({
        title: '创建应用',
        message: '正在创建应用' + this.createApplicationName,
        duration: 0,
      })
      const nameCopy = this.createApplicationName;
      this.createApplicationName = '';
      this.ajax.get(
        '/app/create',
        {app_name: nameCopy},
        this,
        {
          success (res) {
            if (res.msg === 'success') {
              this.alert_msg.success('创建应用成功');
              const application_detail = this.get_info_for_application_name(nameCopy);
              if (Object.keys(application_detail).length !== 0) {
                this.applicationData.push({
                  name: application_detail.name,
                  status: 'active',
                  created_time: application_detail.created_time.substring(0, 19),
                });
                this.applicationData.sort(function (a, b) {
                  if (a['created_time'] > b['created_time']) {
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
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    clickRow(row) {
      this.$router.push({
        name: '应用详情',
        query: {
          name: row.name,
          status: row.status === 'Active' ? '0' : '1'
        }});
    },
  }
}
</script>

<style scoped>

.application-main {
  height: calc(100% - 80px);
}

.application-list {
  width: 98%;
  height: 100%;
  margin-top: 30px;
  margin-left: 1%;
  border: solid 1px rgba(140, 147, 157, 0.5);
  border-radius: 4px;
  background-color: rgba(50, 50, 50, 0.02);
}

.application-buttons {
  height: 50px;
  padding-right: 10px;
  /*border-bottom: solid 1px rgba(140, 147, 157, 0.5);*/
}

.application-buttons .el-button {
  margin-top: 10px;
  margin-left: 10px;
  float: right;
}

.application-list-title  {
  margin-left: 20px;
  margin-top: 16px;
  font-size: 16px;
  color: #6a6a6a;
  float: left
}

.applications {
  height: calc(100% - 90px);
  border-bottom: solid 1px rgba(140, 147, 157, 0.5);
  border-radius: 4px;
}

</style>
