// init document with js
document.body.onload =()=>{
  document.ondragstart=(e)=>{e.preventDefault()} // prevent dragging <img> etc.
  desktopInit() // see details in the function
}

/**
 * xhr.get
 * @param {string} url 
 * @param {function} callback first param as result
 */
const get = (url,callback)=>{
  let xhr = new XMLHttpRequest()
  xhr.open('get',url)
  xhr.send()
  xhr.onreadystatechange = ()=>{
    if(xhr.readyState==4) {
      callback(xhr.response)
    }
  }
}

// change css variables
const changeCssVar = (a,b)=> document.body.style.setProperty(a,b)
var globalTheme = {
  status: 'light',
  change: (dest=null)=>{
    const toDark = ()=>{
      changeCssVar('--theme','0,0,0')
      changeCssVar('--theme-rev','255,255,255')
      changeCssVar('--svg-inv','1')
      globalTheme.status = 'dark'
    }
    const toLight = ()=>{
      changeCssVar('--theme','255,255,255')
      changeCssVar('--theme-rev','0,0,0')
      changeCssVar('--svg-inv','0')
      globalTheme.status = 'light'
    }
    if(dest==null){
      if(globalTheme.status=='light') {
        toDark()
      }else {
        toLight()
      }
      return globalTheme.status
    }else {
      if(dest=='light') {
        toLight()
      }else if(dest=='dark') {
        toDark()
      }else {
        throw TypeError(`Invalid theme: '${dest}'! Only available in 'light' and 'dark'`)
      }
    }
  }
}

// default inset apps here
var apps = [
  {
    id: "system.settings",
    type: "inset",
    onlyOne: true,
    src: "./apps/system/settings.html",
    title: "Settings",
    icon: "./asset/system/settings.svg",
    solidImg: true,
    disableButtons: [false, false, false],
    width: "500px",
    height: "100%"
  },
  {
    id: "system.help",
    type: "inset",
    src: "./apps/system/help.html",
    title: "Help",
    icon: "./asset/system/help.svg",
    solidImg: true,
    disableButtons: [false, true, true],
    width: "500px",
    height: "100%"
  }
]
/**
 * get an app's property in configure file.
 * @param {string} id the id string to get property
 * @returns {object}
 */
function getAppProperty(id) {
  let _app
  apps.forEach((app)=>{
    if(id==app.id) _app = app
  })
  return _app
}

// desktop status in global variables
var desktopStatus = {
  desktopInited: false
}
function desktopInit() {
  if(desktopStatus.desktopInited) throw new Error('Do not init desktop twice!')
  desktopStatus.desktopInited = true

  // set taskbar hiding
  var taskBarTime = 3
  var taskBar = document.getElementById('taskbar')
  var taskBarTimeDropper = setInterval(()=>{
    if(taskBarTime<=0) {
      taskBarTime = 0
      taskBar.style.height = '3px'
    }else {
      taskBarTime --
      taskBar.style.height = '40px'
    }
  },1000)
  taskBar.onmouseover = ()=>{
    taskBarTime = 3
    taskBar.style.height = '40px'
  }

  apps.forEach((app)=>{
    let dom = document.createElement('div')
    dom.className = 'desktop_item'
    if(app.id.indexOf('system.')==0) dom.className += ' system'
    let solidesuka = ''
    if(app.solidImg) solidesuka = ' class="solidColor"'
    dom.innerHTML = `
      <img src="${app.icon}" alt="${app.title}"${solidesuka}/>
      <span>${app.title}</span>
    `
    dom.onclick = ()=>{new ShuWindow(app.id)}
    document.getElementById('desktop').append(dom)
  })
}

// windows manager
var activeApps = []
function ShuWindow(appid) {
  // deal with configures of an app
  let obj = getAppProperty(appid)
  this.appid = appid
  this.builds = {
    type: obj.type || 'iframe',
    onlyOne : obj.onlyOne || false,
    src: obj.src || './apps/system/404.html',
    title: obj.title || 'untitled',
    icon: obj.icon || './asset/logo.png',
    solid: obj.solidImg || false,
    disableButtons: {
      close: obj.disableButtons[0] || false,
      maxi: obj.disableButtons[1] || false,
      hide: obj.disableButtons[2] || false
    },
    width: obj.width || undefined,
    height: obj.height || undefined
  }
  Object.freeze(this.builds)

  if(this.builds.onlyOne) {
    var isReallyOnlyOne = false
    activeApps.forEach((val)=>{
      if(val.appid==obj.id) isReallyOnlyOne = true
    })
    if(isReallyOnlyOne) {
      return `${appid} is already running in onlyOne mode.`
    }
  }
  
  // get last process id and +1 for this process
  if(activeApps.length==0) this.processId = 0
  else this.processId = activeApps[(activeApps.length - 1)].processId + 1
  activeApps.push(this)
  
  // add properties together to DOM
  const init = ()=>{
    this.dom = document.createElement('div')
    this.dom.id = this.builds.title+this.processId
    this.dom.className = 'ShuWindow'
    this.dom.style = style
    this.dom.innerHTML = `
      <div class="header">
        <img src="${this.builds.icon}" alt="setting" class="solidColor">
        <span>${this.builds.title}</span>
        <div class="buttons">
          <div class="ShuWindow_close button${btns[0]}" title="close window"></div>
          <div class="ShuWindow_maximize button${btns[1]}" title="maximize window"></div>
          <div class="ShuWindow_hide button${btns[2]}" title="hide window"></div>
        </div>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="draggers">
        <div class="lt"></div><div class="t"></div><div class="rt"></div>
        <div class="l"></div><div class="r"></div>
        <div class="lb"></div><div class="b"></div><div class="rb"></div>
      </div>
    `
    document.getElementById('windows').append(this.dom)

    this.dom.style.left = (document.getElementById('background').clientWidth
     - this.dom.clientWidth) / 2 + 'px'
    this.dom.style.top = (document.getElementById('background').clientHeight
     - this.dom.clientHeight) / 2 + 'px'

    // == + window events + ==
    const domSize = ()=> this.dom.getBoundingClientRect()
    const eventContainer = document
    eventContainer.onmouseup = ()=>{
      eventContainer.onmousedown = undefined
      eventContainer.onmousemove = undefined
    }
    // drag the window everywhere
    this.dom.getElementsByClassName('header')[0].onmousedown = (e)=>{
      let startPosition = [domSize().left, domSize().top]
      eventContainer.onmousemove = (ev)=>{
        let currentPosition = [ev.clientX - e.clientX + startPosition[0],
         ev.clientY - e.clientY + startPosition[1]]
        this.dom.style.left = currentPosition[0]+'px'
        this.dom.style.top = currentPosition[1]+'px'
      }
    }
    // resize the window with 8 edge divs
    const startSize = ()=> [domSize().left, domSize().top, domSize().width, domSize().height]
    const resizer = (el,lockLeft,lockTop,lockWidth,lockHeight)=> {
      return this.dom.getElementsByClassName(el)[0].onmousedown = (e)=>{
        let ss = startSize()
        eventContainer.onmousemove = (ev)=>{
          let now = [ss[2] - e.clientX + ev.clientX,
           ss[3] - ev.clientY + e.clientY]
          if(!lockLeft) now[0] = ss[2] - ev.clientX + e.clientX
          if(lockTop) now[1] = ss[3] - e.clientY + ev.clientY

          if(now[0]>=90) {
            if(!lockLeft&&!lockWidth) this.dom.style.left = ss[0] - e.clientX + ev.clientX + 'px'
            if(!lockWidth) this.dom.style.width = now[0] + 'px'
          }else {
            if(!lockWidth) this.dom.style.width = '90px'
          }
          if(now[1]>=60) {
            if(!lockTop&&!lockHeight) this.dom.style.top = ss[1] - e.clientY + ev.clientY + 'px'
            if(!lockHeight) this.dom.style.height = now[1] + 'px'
          }else {
            if(!lockHeight) this.dom.style.height = '60px'
          }
        }
      }
    }
    resizer('lt',false,false,false,false)
    resizer('rt',true,false, false,false)
    resizer('rb',true,true,  false,false)
    resizer('lb',false,true, false,false)
    resizer('t',false,false,  true,false)
    resizer('r',true,false,  false,true)
    resizer('b',true,true,    true,false)
    resizer('l',false,true,  false,true)

    this.dom.getElementsByClassName('ShuWindow_close')[0].onclick = this.remove
  }

  // set content style
  let style = ''
  if(this.builds.height!=undefined) style += `height: ${this.builds.height};`
  if(this.builds.width!=undefined) style += `width: ${this.builds.width};`

  // 
  let btns = ['', '', '']
  if(this.builds.disableButtons.close) btns[0] = ' inavailable'
  if(this.builds.disableButtons.maxi) btns[1] = ' inavailable'
  if(this.builds.disableButtons.hide) btns[2] = ' inavailable'

  // set content type. init() is here, so this function must be the last.
  let content
  if(this.builds.type=='inset') {
    get(this.builds.src,(res)=>{
      content = res
      init()
    })
  }else {
    content = `<iframe src="${this.builds.src}"></iframe>`
    init()
  }

  this.remove = ()=>{
    this.dom.remove()
    let thisInArray = activeApps.indexOf(this)
    if(thisInArray==-1) {
      throw new ReferenceError(`process ${this.processId} not found`)
    }else {
      activeApps.splice(thisInArray, 1)
      return `process ${this.processId} removed`
    }
  }
}

