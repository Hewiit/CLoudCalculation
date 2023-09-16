<template>
  <div class="image-detail-main">
    <el-card class="image-card">
      <template #header>
        <div class="card-header">
          <span class="iconfont">&#xe60e;</span>
          <span slot="title" class="card-title">镜像详情</span>
        </div>
      </template>
      <div class="image-detail-card">
        <detail_row
          v-for="(r, index) in detail_list"
          :key="index"
          :title="r.title"
          :content="r.content">
        </detail_row>
      </div>
      <el-button type="danger" icon="el-icon-delete" size="small" @click="deleteImage">删除镜像</el-button>
    </el-card>
    <el-card class="image-card">
      <template #header>
        <div class="card-header">
          <span class="el-icon-collection-tag" style="font-weight: bolder"></span>
          <span slot="title" class="card-title">镜像标签</span>
        </div>
      </template>
      <div class="image-tag-card">
        <image_tag
          class="image-tag"
          v-for="(t, index) in tag_list"
          :key="index"
          :tag_name="t"
          @deleteTag="deleteTag"
          @pullTag="pullTag">
        </image_tag>
      </div>
    </el-card>
    <el-card class="image-card">
      <template #header>
        <div class="card-header">
          <span class="el-icon-edit" style="font-weight: bolder"></span>
          <span slot="title" class="card-title">标记镜像</span>
        </div>
      </template>
      <div class="image-edit-tag-card">
        <el-input placeholder="请输入新的镜像标签" v-model="tag_input" @keyup.enter.native="addTag">
          <el-button slot="append" icon="el-icon-edit" @click="addTag"></el-button>
        </el-input>
        <div class="tag-edit-hint">
          <span class="el-icon-warning" style="margin-right: 10px"></span>
          例如：mysql:5.7（如果镜像名称中没有指定标签,则使用 latest 标签）
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import image_tag from "@/components/image_tag";
import detail_row from "@/components/detail_row";
export default {
  name: "image_detail",
  components: {
    image_tag,
    detail_row
  },
  data() {
    return {
      id: this.$route.query.id,
      tag_list: [

      ],
      detail_list: [{
          title: 'ID',
          content: ''
        }, {
          title: '操作系统',
          content: ''
        }, {
          title: '架构',
          content: ''
        }, {
          title: '大小',
          content: ''
        }, {
          title: '创建时间',
          content: ''
        },
      ],
      tag_input: '',
    }
  },
  mounted() {
    this.apply_for_info();
  },
  methods: {
    apply_for_info() {
      const image_detail = this.get_info_for_image_id(this.id);
      console.log(image_detail);
      if (Object.keys(image_detail).length !== 0) {
        this.detail_list[0].content = image_detail.Id;
        this.detail_list[1].content = image_detail.Os;
        this.detail_list[2].content = image_detail.Architecture;
        this.detail_list[3].content = (Number(image_detail.Size) / 1048576).toFixed(2) + 'MB';
        this.detail_list[4].content = image_detail.Created.substring(0, 10) + ' ' + image_detail.Created.substring(11, 19);
        this.tag_list = image_detail.Tag;
      } else {
        this.alert_msg.error('获取镜像详情失败');
      }
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
    deleteImage() {
      const that = this;
      this.$confirm('是否删除该镜像?', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        that.ajax.get(
          '/ims/rm',
          {im_id: that.id},
          that,
          {
            success (res) {
              if (res.res === 0) {
                that.alert_msg.success('删除镜像成功');
                that.$router.push({name: '镜像管理'});
              } else {
                that.alert_msg.error('删除镜像失败');
              }
            },
            error() {
              that.alert_msg.error('删除镜像失败');
            }},
          {async: false}
        );
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    deleteTag(tag) {
      const that = this;
      this.$confirm('是否删除该标签?', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        that.ajax.get(
          '/ims/rm',
          {im_id: tag},
          that,
          {
            success (res) {
              if (res.res === 0) {
                for(let i = 0; i < that.tag_list.length; i++){
                  if (that.tag_list[i] === tag) {
                    that.tag_list.splice(i, 1);
                    break;
                  }
                }
                that.alert_msg.success('删除tag成功');
              } else {
                that.alert_msg.error('删除tag失败');
              }
            },
            error() {
              that.alert_msg.error('删除tag失败');
            }},
          {async: false}
        );
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    pullTag(tag) {
      this.alert_msg.success('拉取成功' + tag);
    },
    addTag() {
      if (this.tag_input !== '') {
        const tag_input_copy = this.tag_input;
        this.tag_input = '';
        if (tag_input_copy.indexOf(':') !== -1) {
          this.ajax.get(
            '/ims/tag',
            {
              im_id: this.id,
              im_p1: tag_input_copy.substring(0, tag_input_copy.indexOf(':')),
              im_p2: tag_input_copy.substring(tag_input_copy.indexOf(':') + 1),
            },
            this,
            {
              success (res) {
                if (res.res === 0) {
                  this.alert_msg.success('添加标签成功');
                  this.tag_list.push(tag_input_copy);
                } else {
                  this.alert_msg.error('添加标签失败');
                }
              },
            },
          );
        } else {
          this.alert_msg.warning('标签格式有误');
        }
      } else {
        this.alert_msg.warning('标签不能为空');
      }
    }
  }
}
</script>

<style scoped>

.image-card {
  margin-bottom: 20px;
  padding-bottom: 10px;
}

.image-detail-card {
  margin-bottom: 30px;
}

.image-tag {
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

.tag-edit-hint {
  color: goldenrod;
  margin-top: 10px;
}

</style>
