const http = require('http')
const fs = require('fs')
const path = require('path')

var port = process.env.PORT || 8088
var host = process.env.HOSTNAME || 'localhost'
http.createServer((req,res)=>{
  let pathName = path.join(__dirname,'index.html')
  let page = fs.readFileSync(pathName)
  res.write(page)
  res.end()
}).listen(port)

console.log(`http://${host}:${port}`)