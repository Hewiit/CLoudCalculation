<template>
  <div>
    <el-tag class="tag">
      {{ this.tag_name }}
      <!--el-button class="tag-button1" type="primary" icon="el-icon-download" @click="pullThisTag"></el-button-->
      <el-button class="tag-button2" type="primary" icon="el-icon-delete" @click="deleteThisTag"></el-button>
    </el-tag>
    <!--el-tag class="tag-no-button">
      {{ this.tag_name }}
    </el-tag-->
  </div>
</template>

<script>
export default {
  name: "image_tag",
  props: {
    tag_name: {
      type: String,
      default: ''
    }
  },
  methods: {
    deleteThisTag() {
      this.$emit('deleteTag', this.tag_name);
    },
    pullThisTag() {
      this.$emit('pullTag', this.tag_name);
    }
  }
}
</script>

<style scoped>

.tag-no-button {
  border: #d8d8d8 solid 1px;
  font-size: 16px;
  color: #757575;
}

.tag {
  height: 40px;
  padding-right: 0;
  border: #d8d8d8 solid 1px;
  font-size: 16px;
  color: #757575;
}

.tag-button1 {
  width: 38px;
  padding: 12px;
  border: none;
  border-radius: 0;
  margin-left: 5px;
}

.tag-button2 {
  width: 38px;
  padding: 12px;
  border: none;
  border-left: #657fa4 solid 1px;
  border-radius: 0 3px 3px 0;
  /*margin-left: -5px;*/
  margin-left: 5px;
}

</style>
