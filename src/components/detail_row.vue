<template>
  <div class="detail-row-main">
    <span class="detail-title">{{ this.title }}</span>
    <span class="detail-content" v-if="this.title !== '状态'">{{ this.content }}</span>
    <el-tag size="small" v-if="this.title === '状态'"
            :type="this.content === 'running' ? 'success' : (this.content === 'created' ? 'primary' : 'danger')"
            style="font-weight: bold">{{ this.content }}
    </el-tag>
  </div>
</template>

<script>
export default {
  name: "detail_row",
  props: {
    title: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    }
  },
}
</script>

<style scoped>

.detail-row-main {
  border-bottom: solid 2px rgba(140, 147, 157, 0.5);
  height: 30px;
  margin-bottom: 10px;
}
.detail-title {
  font-weight: bold;
  width: 150px;
  display: inline-block;
}

</style>
