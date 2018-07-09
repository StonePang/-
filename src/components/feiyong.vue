<template>
  <div>
    <!-- 头 -->
    <el-form :inline="true" :model="formModel" class="demo-form-inline">
      <el-form-item label="费用名称">
        <el-input v-model="formModel.name" placeholder="请输入费用名称" clearable></el-input>
      </el-form-item>
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="formModel.date"
          type="daterange"
          value-format='timestamp'
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          clearable>
        </el-date-picker>
      </el-form-item>
      <el-form-item label="总费用">
        <el-input v-model="formModel.money" placeholder="请输入总费用" type='number' clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit" :disabled='calDisabled()'>计算</el-button>
        <el-button type="primary" @click="dialogTableVisible=true" :disabled='tableData.length===0'>详细列表</el-button>
      </el-form-item>
    </el-form>
    <el-button type="primary" @click="add" :disabled='addDisabled()'>添加人员</el-button>

    <!-- 体 -->
    <div>
      <div v-for='(item, index) in formModel.content' :key='index'>
        <el-form :inline="true" :model="item" class="demo-form-inline">
          <el-form-item label="姓名">
            <el-input v-model="item.name" placeholder="请输入姓名" clearable></el-input>
          </el-form-item>
          <el-form-item label="有效时间范围">
            <ranges :start='formModel.date[0]' :end='formModel.date[1]' v-model='item.date'></ranges>
          </el-form-item>
          <el-form-item label="费用">
            <el-input v-model="item.money" placeholder="请输入费用" clearable disabled></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="danger" @click="deleteItem(item)">删除本条</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <!-- table -->
    <div v-if='tableData.length>0' style="{width: 50%; margin:0 auto}">
      <div class='left'>
        <div>费用名称： {{formModel.name}}</div>
        <div>总费用：{{formModel.money}} 元</div>
        <div>时间： {{dateString(formModel.date[0])}}至{{dateString(formModel.date[1])}}</div>
        <div>总天数： {{totalDays}}</div>
        <div>有效天数： {{validDays}}</div>
        <div>总人天数： {{totalCount}}</div>
      </div>
      <div style="{width: 50%; margin:0 auto}"> 
        <el-table
          :data="tableData"
          style="width: 100%"
          stripe
          border
          show-summary	
          >
          <el-table-column
            prop="name"
            label="姓名"
            width="100"
            header-align='center'>
          </el-table-column>
          <el-table-column
            prop="date"
            label="日期"
            width="200"
            header-align='center'>
            <template slot-scope="scope">
              <div v-for='item in tableData[scope.$index].date' :key='item'>{{item}}</div>
            </template>
          </el-table-column>
          <el-table-column
            prop="count"
            label="在家天数"
            width="100"
            header-align='center'>
          </el-table-column>
          <el-table-column
            prop="money"
            label="费用"
            width="200"
            header-align='center'>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <el-dialog title="费用详情表格" :visible.sync="dialogTableVisible" width='80%'>
      <el-table
        :data="detailData"
        style="width: 100%"
        stripe
        border
        show-summary	
        >
        <el-table-column
          prop="date"
          label="日期"
          width="100"
          header-align='center'>
        </el-table-column>

        <el-table-column 
          v-for='(item, index) in a'
          :key='index'
          :prop="item"
          :label="item"
          width="200"
          :formatter='formatter'
          header-align='center'>
        </el-table-column>
        <el-table-column
          prop="count"
          label="每日分摊人数"
          width="200"
          header-align='center'>
        </el-table-column>
        <el-table-column
          prop="dayMoney"
          label="每日分摊费用"
          width="200"
          header-align='center'>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import utils from './utils'
import ranges from './date-range'
const oneDay = 24*60*60*1000
export default {
  components: {
    ranges,
  },
  data() {
    return {
      dialogTableVisible: false,
      totalCount: 0,
      tableData: [],
      detailData: [],
      formModel: {
        name: '',
        date: [],
        money: undefined,
        content: []
      },
    }
  },
  computed: {
    validDays() {
      return this.validateDateArray().length
    },
    totalDays() {
      return this.totalDateArray().length
    },
    // moneyOneDay() {
    //   return this.formModel.money / this.days
    // },
    a() {
      return this.formModel.content.map(c => {
        return c.name
      }) 
    },
    per() {
      return this.formModel.money / this.totalCount
    }
  },
  methods: {
    formatter(a,b,c) {
      if(c === 0) {
        return '————'
      }
      return c
    },
    gettotalCount(data) {
      let sum = 0
      data.forEach(d=> {
        sum += d.count
      })
      return sum
    },
    getdetailData() {
      let datas = this.getTimeLine()
      // this.totalCount = this.gettotalCount(datas)
      let res = {}
      datas.forEach(data => {
        // let per = this.moneyOneDay / data.count
        let r = {}
        r.date = data.date
        r.count = data.count
        r.dayMoney = this.per * data.count
        this.a.forEach(e=> {
          if (data.stage.indexOf(e) !== -1) {
            r[e] = this.per
          }else {
            r[e] = 0
          }
        })
        res[data.date] = r
      })
      let total = this.totalDateArray()
      let result = total.map(day => {
        let r = {}
        if (res[day]) {
          r = res[day]
        } else {
          r.date = day
          r.count = 0
          r.dayMoney = 0
          this.a.forEach(e=> {
            r[e] = 0
          })
        }
        return r
      })
      //console.log('detail', result)
      return result
    },
    dateString(unix) {
      return utils.date(unix)
    },
    getTableData() {
      return this.formModel.content.map(c => {
        //console.log(c.date)
        return {
          name: c.name,
          money: c.money,
          date: utils.rangString(c.date),
          count: c.count
        }
      })
    },
    log(string) {
      //console.log(string)
    },
    onSubmit() {
      if(this.chongfu()) {
        //console.log('名字重复')
        return
      }
      if(this.noName()) {
        //console.log('名字为空')
        return
      }
      if (this.kong()) {
        //console.log('没有条目')
        return
      }
      this.cal()
      //console.log('submit!',this.formModel.content);
      let sum = 0
      this.formModel.content.forEach(c=> {
        sum += c.money
      })
      this.log(sum)
      this.tableData = this.getTableData()
      this.detailData = this.getdetailData()
    },
    add() {
      let def = this.formModel.date
      this.formModel.content.push({
        name: '',
        date: [def],
        money: 0,
        count: 0,
      })
    },
    totalDateArray() {
      let startTime = this.formModel.date[0]
      let endTime = this.formModel.date[1]
      let arr = utils.SEarrayInString(startTime, endTime)
      return arr
    },
    validateDateArray() {
      let total = this.totalDateArray()
      let stages = this.stagesArray()
      return total.filter(day => {
        for (const name in stages) {
          if (stages.hasOwnProperty(name)) {
            const stageLine = stages[name];
            if (stageLine.includes(day)) {
              return true
            }
          }
        }
        return false
      })
    },
    stagesArray() {
      let r = {}
      this.formModel.content.forEach(c=> {
        // let startTime = c.date[0]
        // let endTime = c.date[1]
        // let name = c.name
        // let arr = utils.SEarrayInString(startTime, endTime)
        let dateArr = this.stageArray(c.date)
        let name = c.name
        r[name] = dateArr
      })
      //console.log(r)
      return r
    },
    stageArray(dateArr) {
      let r = []
      dateArr.forEach(e=> {
        let startTime = e[0]
        let endTime = e[1]
        let arr = utils.SEarrayInString(startTime, endTime)
        r = [...r, ...arr]
      })
      return r
    },
    getTimeLine() {
      let total = this.validateDateArray()
      let stages = this.stagesArray()
      let r = total.map(day => {
        let res = {
          stage: [],
          count: 0,
          date: day,
        }
        for (const name in stages) {
          if (stages.hasOwnProperty(name)) {
            const stageLine = stages[name];
            if (stageLine.includes(day)) {
              res.stage.push(name)
              res.count += 1
            }
          }
        }
        return res
      })
      //console.log('timeline', r)
      return r
    },
    cal() {
      let o = {}
      this.formModel.content.forEach(c=> {
        o[c.name] = 0
        c.money = 0
        c.count = 0
      })
      let tl = this.getTimeLine()
      this.totalCount = this.gettotalCount(tl)
      tl.forEach(day => {
        // let per = this.moneyOneDay / day.count
        // //console.log(day, per, this.moneyOneDay)
        day.stage.forEach(name => {
          this.formModel.content.forEach(c => {
            if (name === c.name) {
              // //console.log(day.date, name,o[name])
              c.money += this.per
              c.count += 1
            }
          })
        })
      })
      //console.log(this.formModel.content)
    },
    chongfu() {
      return this.a.some(name => {
        let f = this.a.indexOf(name)
        let l = this.a.lastIndexOf(name)
        return f !== l
      })
    },
    calDisabled() {
      let r = !(this.formModel.name && this.formModel.date.length > 0 && this.formModel.money)
      let contentnotvalid = this.chongfu() || this.kong() || this.noName()
      return r || contentnotvalid
    },
    addDisabled() {
      let r = !(this.formModel.name && this.formModel.date.length > 0 && this.formModel.money)
      return r
    },
    kong() {
      return this.a.length === 0
    },
    noName() {
      return this.a.some(e => {
        return e === ''
      })
    },
    deleteItem(item) {
      let index = this.formModel.content.indexOf(item)
      if(index !== -1) {
        this.formModel.content.splice(index, 1)
      }
    }
    

  },

    
}
</script>

<style scoped>
.left {
  text-align: left;
  margin-bottom: 30px;
}
</style>


