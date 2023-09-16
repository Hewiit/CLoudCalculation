<template>
  <div class="image-main">
    <div class="image-list">
      <div class="image-buttons">
        <div class="image-list-title"><span class="iconfont">&#xe60e;</span>&nbsp;镜像列表</div>
        <el-button type="danger" size="small" @click="deleteImage">删除镜像</el-button>
        <el-button type="primary" size="small" @click="pullImage">创建新镜像</el-button>
        <!--el-button type="success" size="small">导出镜像</el-button-->
      </div>
      <div class="image-search">
        <el-input v-model="input" placeholder="搜索本地镜像" @keyup.enter.native="search">
          <el-select v-model="select" slot="prepend" placeholder="请选择" style="width: 80px">
            <el-option label="标签" value="1"></el-option>
          </el-select>
          <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
        </el-input>
      </div>
      <div class="images">
        <el-table
          :data="imageData"
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
            prop="id"
            label="id"
            min-width="2">
          </el-table-column>
          <el-table-column
            prop="tag"
            label="标签"
            min-width="2">
          </el-table-column>
          <el-table-column
            prop="size"
            label="大小"
            min-width="1">
          </el-table-column>
          <el-table-column
            prop="time"
            label="创建时间"
            min-width="2">
          </el-table-column>
        </el-table>
      </div>
    </div>
    <el-dialog
      title="拉取新镜像"
      :visible.sync="pullImageDialog"
      width="30%">
      <div style="margin-bottom: 10px">
        <div style="margin-bottom: 5px; font-size: 16px">镜像名称: </div>
        <el-input v-model="pullImageName" ref="firstInput"></el-input>
      </div>
      <div>
        <div style="margin-bottom: 10px">
          <div style="margin-bottom: 5px; font-size: 16px">镜像版本: </div>
          <el-input v-model="pullImageTag"></el-input>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="pullImageDialog = false">取 消</el-button>
        <el-button type="primary" @click="confirmPullImage">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "image",
  data() {
    return {
      input: '',
      select: '1',
      /*imageData: [{
        id: 'sha256:14119a10abf4669e8cdbdff324a9f9605d99697215a0d21c360fe8dfa8471baa',
        tag: 'alpine1:latest',
        size: '5.6 MB',
        time: '2021-08-28 01:19:45'
      }, {
        id: 'sha256:14119a10abf4669e8cdbdff324a9f9605d99697215a0d21c360fe8dfa8471bab',
        tag: 'alpine2:latest',
        size: '5.7 MB',
        time: '2021-08-28 01:19:46'
      }, {
        id: 'sha256:14119a10abf4669e8cdbdff324a9f9605d99697215a0d21c360fe8dfa8471bac',
        tag: 'alpine3:latest',
        size: '5.8 MB',
        time: '2021-08-28 01:19:47'
      }],*/
      imageData: [],
      imageDataCopy: [],
      multipleSelection: [],
      pullImageDialog: false,
      pullImageName: '',
      pullImageTag: 'latest',
      pulling: false,
    }
  },

  mounted() {
    //console.log(this.$router);
    this.apply_for_info();
    /*this.imageData = [{
      id: 'sha256:14119a10abf4669e8cdbdff324a9f9605d99697215a0d21c360fe8dfa8471baa',
      tag: 'alpine1:latest',
      size: '5.6 MB',
      time: '2021-08-28 01:19:45'
    }, {
      id: 'sha256:14119a10abf4669e8cdbdff324a9f9605d99697215a0d21c360fe8dfa8471bab',
      tag: 'alpine2:latest',
      size: '5.7 MB',
      time: '2021-08-28 01:19:46'
    }, {
      id: 'sha256:14119a10abf4669e8cdbdff324a9f9605d99697215a0d21c360fe8dfa8471bac',
      tag: 'alpine3:latest',
      size: '5.8 MB',
      time: '2021-08-28 01:19:47'
    }]*/
  },

  methods: {
    apply_for_info() {
      this.ajax.get(
        '/ims/ls',
        {},
        this,
        {
          success: function (res) {
            if (res.res === 0) {
              this.imageData = [];
              for (let image_id of res.im) {
                let image_detail = this.get_info_for_image_id(image_id);
                if (Object.keys(image_detail).length !== 0) {
                  this.imageData.push({
                    real_id: image_detail.Id,
                    id: image_detail.Id.substring(0, 30) + "...",
                    tag: image_detail.Tag[0],
                    size: (Number(image_detail.Size) / 1048576).toFixed(2) + 'MB',
                    time: image_detail.Created.substring(0, 10) + ' ' + image_detail.Created.substring(11, 19),
                  });
                }
              }
              this.imageData.sort(function (a, b) {
                if (a['time'] > b['time']) {
                  return -1;
                } else {
                  return 1;
                }
              });
            } else {
              this.alert_msg.error('拉取镜像列表失败');
            }
          },
        }
      );
    },
    get_info_for_image_id(image_id) {
      let ret = {};
      this.ajax.get(
        '/ims/get',
        {id: image_id},
        this,
        {
          success (res) {
            if (res.res === 0) {
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
          '/ims/search',
          {keyword: this.input},
          this,
          {
            success: function (res) {
              if (res.res === 0) {
                this.imageData = [];
                for (let image_id of res.im) {
                  let image_detail = this.get_info_for_image_id(image_id);
                  if (Object.keys(image_detail).length !== 0) {
                    this.imageData.push({
                      real_id: image_detail.Id,
                      id: image_detail.Id.substring(0, 30) + "...",
                      tag: image_detail.Tag[0],
                      size: (Number(image_detail.Size) / 1048576).toFixed(2) + 'MB',
                      time: image_detail.Created.substring(0, 10) + ' ' + image_detail.Created.substring(11, 19),
                    });
                  }
                }
                this.imageData.sort(function (a, b) {
                  if (a['time'] > b['time']) {
                    return -1;
                  } else {
                    return 1;
                  }
                });
              } else {
                this.alert_msg.error('搜索镜像失败');
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
        name: '镜像详情',
        query: {
          id: row.real_id.substring(7),
        }});
    },
    pullImage() {
      this.pullImageDialog = true;
      const that = this;
      setTimeout(function () {
        that.$refs.firstInput.focus();
      }, 0);
    },
    confirmPullImage() {
      this.pullImageDialog = false;
      const notice = this.$notify({
        title: '拉取镜像',
        message: '正在拉取 ' + this.pullImageName + ':' + this.pullImageTag,
        duration: 0,
      })
      this.ajax.get(
        '/ims/pull',
        {im_name: this.pullImageName, im_tag: this.pullImageTag},
        this,
        {
          success (res) {
            if (res.res === 0) {
              this.alert_msg.success('拉取镜像成功');
              const image_detail = this.get_info_for_image_id(res.im_id);
              this.imageData.push({
                real_id: image_detail.Id,
                id: image_detail.Id.substring(0, 30) + "...",
                tag: image_detail.Tag[0],
                size: (Number(image_detail.Size) / 1048576).toFixed(2) + 'MB',
                time: image_detail.Created.substring(0, 10) + ' ' + image_detail.Created.substring(11, 19),
              });
              this.imageData.sort(function (a, b) {
                if (a['time'] > b['time']) {
                  return -1;
                } else {
                  return 1;
                }
              });
            } else {
              this.alert_msg.error('拉取镜像失败');
            }
            notice.close();
          },
          error() {
            this.alert_msg.error('拉取镜像失败');
            notice.close();
          }
        },
      );
    },
    deleteImage() {
      if (this.multipleSelection.length !== 0) {
        const that = this;
        this.$confirm('是否删除这些镜像?', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          for (let image of that.multipleSelection) {
            that.ajax.get(
              '/ims/rm',
              {im_id: image.real_id},
              that,
              {
                success (res) {
                  if (res.res === 0) {
                    for (let i = 0; i < that.imageData.length; i++){
                      if (that.imageData[i].real_id === image.real_id) {
                        that.imageData.splice(i, 1);
                        //that.alert_msg.success('删除镜像' + image.tag + '成功');
                        break;
                      }
                    }
                  } else {
                    that.alert_msg.error('删除镜像' + image.tag + '失败');
                  }
                },
                error() {
                  that.alert_msg.error('删除镜像' + image.tag + '失败');
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

.image-main {
  height: calc(100% - 80px);
}

.image-list {
  width: 98%;
  height: 100%;
  margin-top: 30px;
  margin-left: 1%;
  border: solid 1px rgba(140, 147, 157, 0.5);
  border-radius: 4px;
  background-color: rgba(50, 50, 50, 0.02);
}

.image-buttons {
  height: 50px;
  padding-right: 10px;
  /*border-bottom: solid 1px rgba(140, 147, 157, 0.5);*/
}

.image-buttons .el-button {
  margin-top: 10px;
  margin-left: 10px;
  float: right;
}

.image-list-title  {
  margin-left: 20px;
  margin-top: 16px;
  font-size: 16px;
  color: #6a6a6a;
  float: left
}

.images {
  height: calc(100% - 90px);
  border-bottom: solid 1px rgba(140, 147, 157, 0.5);
  border-radius: 4px;
}

</style>
