const http = require('http')
const fs = require('fs')
const path = require('path')

mongoClient.connect()
mongoClient

const privatef = (file) => {
  let pathname = path.join(__dirname,file)
  return fs.readFileSync(pathname)
}
const publicf = (file) => fs.readFileSync(file)

var port = process.env.PORT || 3456
var host = process.env.HOSTNAME || 'localhost'
const app = http.createServer((req,res)=>{
  let urlP = new URL(req.url,`http://${req.headers.host}`).searchParams
  let url = req.url
  console.log('s')

}).listen(port)

console.log(`http://${host}:${port}`)
module.exports = app