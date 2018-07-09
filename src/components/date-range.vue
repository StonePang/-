<template> 
<div>    
  <!-- <el-button @click='add'>添加时间</el-button> -->

  <div>
    <div v-for='(item, index) in formModel' :key='index'>
      <el-date-picker
        v-model="formModel[index]"
        type="daterange"
        value-format='timestamp'
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        clearable
        :picker-options="pickerOptions">
      </el-date-picker>
      <el-button @click='add'>添加时间段</el-button>
      <el-button @click='del(index)' type='danger' :disabled='formModel.length === 1'>删除</el-button>
    </div>
  </div> 

</div>
</template>

<script>
export default {
  props: {
    start: Number,
    end: Number,
    value: Array
  },
  computed: {
    formModel: {
      get() {
        return this.value
      },
      set(v) {
        this.$emit('input', v)
      }
    }
  },
  data() {
    return {
      // formModel: [[]],
      pickerOptions: {
        disabledDate: time => {
          let totalstart = this.start
          let totalend = this.end
          // let preStart = 
          return time.getTime() < totalstart || time.getTime() > totalend
        }
      }
    }
  },
  methods: {
    add() {
      this.formModel.push([])
      //////console.log(this.formModel)
    },
    del(index) {
      this.formModel.splice(index, 1)
      //////console.log(this.formModel)
    }

  }
  
}
</script>
<style scoped>

</style>

