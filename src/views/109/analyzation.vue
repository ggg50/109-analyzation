<template>
  <div class="app-container">
    <div class="text">
      <div>总计打卡天数（减去当天）: {{ dayCount }} 天</div>
      <br>
      <div>是否有同学班级信息：{{ hasId ? '有' : '无' }} <span v-if="!hasId" style="color: red;"> (这个信息要通过提交 “统计表” 获取) </span></div>
      <br>
    </div>
    <upload-excel-component
      :on-success="handleStatisticalData"
      :before-upload="beforeUpload"
      title="统计表传这里↓↓↓"
    />
    <upload-excel-component
      :on-success="handleParticipationData"
      :before-upload="beforeUpload"
      title="参与概况表传这里↓↓↓"
    />
    <el-table
      :data="tableData"
      border
      highlight-current-row
      style="width: 100%;margin-top:20px;"
    >
      <el-table-column
        v-for="item of tableHeader"
        :key="item.key"
        sortable
        :prop="item.key"
        :label="item.name"
      />
    </el-table>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import UploadExcelComponent from '@/components/UploadExcel/index.vue'
import { groupBy } from 'lodash'

const studentKey = '学员Id'

interface RowItem {
  '学员Id': string
  '分组'?: string
  [key: string]: any
}

interface TableItem {
  name: string
  totalMember: number
  allPunching: number
  fullPresent: number
  fullPresentRage: string
}

@Component({
  name: 'UploadExcel',
  components: {
    UploadExcelComponent
  }
})
export default class extends Vue {
  private tableData: TableItem[] = []
  private dayCount = 3
  private tableHeader = [
    { name: '班级', key: 'name' },
    { name: '总打卡数', key: 'allPunching' },
    { name: '参与人数', key: 'totalMember' },
    { name: '全勤人数', key: 'fullPresent' },
    { name: '全勤率', key: 'fullPresentRage' }
  ]

  private idList: string[] = []
  private dateList: string[] = []
  private idMap: {[key: string]: string[]} = {}
  private punchingMap: {[key: string]: RowItem[]} = {}
  private startDate = '2021-4-19'
  private participationData: RowItem[] = []

  get hasId() {
    return !!Object.keys(this.idMap).length
  }

  get idClassMap() {
    const _map: {[key: string]: string} = {}
    for (const key in this.idMap) {
      for (const id of this.idMap[key]) {
        _map[id] = key
      }
    }

    return _map
  }

  @Watch('idMap')
  @Watch('participationData')
  calculation() {
    if (!this.hasId || !this.participationData.length) return
    this.participationData.forEach(item => (item['分组'] = this.idClassMap[item['学员Id']] || '未打卡'))
    this.tableData = this.handlePunchingAnalyzation(this.participationData)
  }

  created() {
    this.dayCount = this.getPunchingDayCount()

    this.idMap = JSON.parse(window.localStorage.getItem('idMap') || '{}')
  }

  private beforeUpload(/* file: File */) {
    // const isLt1M = file.size / 1024 / 1024 < 10
    // if (isLt1M) {
    //   return true
    // }
    // this.$message({
    //   message: 'Please do not upload files larger than 10m in size.',
    //   type: 'warning'
    // })
    return true
  }

  /**
   * 计算打卡了几天
   */
  private getPunchingDayCount() {
    const _allDay = Math.floor((Date.now() - new Date(this.startDate).getTime()) / 86400000)
    const _restDay = (Math.floor(_allDay / 7)) * 2 // 每周 2天 是休息
    return _allDay - _restDay
  }

  // 处理统计表的信息
  // 目前主要是为了获取 班级 信息，会处理成 idMap
  private handleStatisticalData({ results }: { results: RowItem[], header: string[]}) {
    // eslint-disable-next-line no-prototype-builtins
    if (results[0] && results[0].hasOwnProperty('分组')) {
      // this.get109Ids(results)
      this.catchIds(results)
    } else {
      this.$message.warning('文件可能传错地方了')
    }
  }

  private handleParticipationData({ results, header }: { results: RowItem[], header: string[]}) {
    // eslint-disable-next-line no-prototype-builtins
    if (results[0] && results[0].hasOwnProperty('分组')) {
      this.$message.warning('文件可能传错地方了')
    } else {
      this.participationData = results
      this.dateList = header.filter(item => /\d+/.test(item))
    }
  }

  handlePunchingAnalyzation(list: RowItem[]): TableItem[] {
    // this.punchingMap = groupBy(results, item => item['分组'])
    const _punchingMap = groupBy(list, item => item['分组'])
    const result: TableItem[] = []

    for (const className in _punchingMap) {
      let _allCount = 0
      let _fullCount = 0

      _punchingMap[className].forEach(item => {
        const _count = this.punchingCount(item)
        _allCount += _count
        if (_count === this.dayCount) _fullCount += 1
      })

      result.push({
        name: className,
        totalMember: _punchingMap[className].length,
        allPunching: _allCount,
        fullPresent: _fullCount,
        fullPresentRage: Math.floor((_fullCount / _punchingMap[className].length) * 100) + '%'
      })
    }

    return result
  }

  private punchingCount(item: RowItem) {
    let _count = 0
    for (const date of this.dateList) {
      if (['√', '补打卡'].includes(item[date])) {
        _count += 1
      }
    }
    return _count
  }

  private catchIds(list: RowItem[]) {
    const _group = groupBy(list, item => item['分组'])
    const _idMap: {[key: string]: string[]} = {}
    for (const key in _group) {
      _idMap[key] = _group[key].map(item => item['学员Id'])
    }

    this.idMap = _idMap
    window.localStorage.setItem('idMap', JSON.stringify(this.idMap))
  }

  handleData(results: any[]) {
    return results.filter(item => {
      console.log(item)
      console.log(this.idList.includes(item[studentKey]))
      return this.idList.length
        ? this.idList.includes(item[studentKey])
        : item['分组'] === '109班'
    })
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  &::v-deep {
    .upload-wrapper {
      display: inline-block;
      width: 50%;
    }

    .drop {
      width: 100%;
      display: inline-block;
    }
  }
}
</style>
