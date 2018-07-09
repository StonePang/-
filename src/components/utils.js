// import date from './date'
export default {
  oneDay: 24 * 60 * 60 * 1000,
  add0(m) {
    return m < 10 ? '0' + m : m
  },
  date(timestamp) {
    var time = new Date(timestamp)
    var y = time.getFullYear()
    var m = time.getMonth() + 1
    var d = time.getDate()
    return y + '/' + this.add0(m) + '/' + this.add0(d)
  },
  SEarrayInString(s, e) {
    let r = []
    for (let i = s; i <= e; i+=this.oneDay) {
      let date = this.date(i)
      r.push(date)
    }
    return r
  },
  rangString(arr) {
    let r = []
    arr.forEach(d=> {
      let start = this.date(d[0])
      let end = this.date(d[1])
      let s = `${start}-${end}`
      r.push(s)
    })
    return r
  }
}
