// init document with js
document.body.onload =()=>{
  document.ondragstart=(e)=>{e.preventDefault()} // prevent dragging <img> etc.
}
// global customize events
// callbacks all here
var shuEventsList = {
  appOpen: [],
  appClose: [],
  appMaxi: [],
  appMini: [],
  appFocused:[]
}
// internal handler to dispatch from events
const shuEventHandler = {
  appOpen: (process)=>{
    shuEventsList.appOpen.forEach((func)=>{
      func.callback(process)
    })
  },
  appClose: (process)=>{
    shuEventsList.appClose.forEach((func)=>{
      func.callback(process)
    })
  },
  appMaxi: (process)=>{
    shuEventsList.appMaxi.forEach((func)=>{
      func.callback(process)
    })
  },
  appMini: (process)=>{
    shuEventsList.appMini.forEach((func)=>{
      func.callback(process)
    })
  },
  appFocused: (process)=>{
    shuEventsList.appFocused.forEach((func)=>{
      func.callback(process)
    })
  }
}
/**
 * Add a new event listener from the Shu events.
 * Use `new` to return an object with `remove` function.
 * @see shuEventHandler for principles
 * @see shuEventsList for list of events
 * 
 * @param {string} event event name. supports `appOpen`, `appClose` etc.
 * @param {function} callback callback this function with parameters.
 */
function ShuEvent(event, callback) {
  this.name = event
  let list = shuEventsList[event]
  if(list) {
    list.push(this)
  }
  else {
    throw Error(`Undefined ShuEvent '${event}'!`)
  }
  this.callback = callback
  if(typeof(callback)!='function') {
    throw Error(`Invalid function: '${callback}'!`)
  }
  this.remove = ()=>{
    let ind = list.indexOf(this)
    if(ind==-1) {
      throw Error(`${this.name} already cleared.`)
    }
    list.splice(ind,1)
    return true
  }
}
ShuEvent.prototype = {
  get [Symbol.toStringTag]() {
    return 'ShuEvent'
  }
}

/**
 * xhr.get
 * @param {string} url 
 * @param {function} callback first param as result, second as status code
 */
const get = (url,callback)=>{
  let xhr = new XMLHttpRequest()
  xhr.open('get',url)
  xhr.send()
  xhr.onreadystatechange = ()=>{
    if(xhr.readyState===4) {
      callback(xhr.response, xhr.status)
    }
  }
}
const postSettings = ()=> {
  if(desktopStatus.use!=='api') throw new Error('Api mode only!')
  let xhr = new XMLHttpRequest()
  xhr.setRequestHeader('content-type','application/json')
  xhr.open('post',desktopStatus.api)
  xhr.send(JSON.stringify(shuSettings))
}

var shuSettings

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
    disableResize: false,
    width: "500px",
    height: "600px"
  },
  {
    id: "system.help",
    type: "inset",
    src: "./apps/system/help.html",
    title: "Help",
    icon: "./asset/system/help.svg",
    solidImg: true,
    disableButtons: [false, true, true],
    disableResize: true,
    width: 500,
    height: "100px"
  },
  {
    id: "system.taskm",
    type: "inset",
    src: "./apps/system/taskm.html",
    title: "Task Manager",
    icon: "./asset/system/taskm.svg",
    solidImg: true,
    onlyOne: true,
    width: 500,
    height: 600
  }
]
// read and apply configures
get('./conf.json',(res,code)=>{
  if(code===200) {
    let result = JSON.parse(res)
    if(result.use==='static') {
      desktopStatus.use = 'static'
      desktopStatus.static = result.static
      if(!desktopStatus.static.endsWith('/')) desktopStatus.static += '/'
      get(desktopStatus.static+'apps.json', (res, code)=>{
        if(code===404) return new Error('apps.json not found')
        let result = JSON.parse(res)
        apps = apps.concat(result)
        shudesktopInit()
      })
      get(desktopStatus.static+'settings.json', (res, code)=>{
        if(code===404) return new Error('settings.json not found')
        let result = JSON.parse(res)
        shuSettings = result
        shusettingsInit()
      })
    }else {
      desktopStatus.use = 'api'
      desktopStatus.api = result.api
    }
  }else {
    document.body.insertAdjacentHTML('afterbegin',`
      <div id="errorMessage">
        HTTP ${code}: No configure file found! 
        Try to touch <code>conf.json</code> or <a href="
https://developer.mozilla.org/zh-CN/docs/Learn/Common_questions/set_up_a_local_testing_server
        ">run a local server.</a><br/>
        Tips: You can directly use <a href="
https://www.npmjs.com/package/iipub
        "><code>ii server</code></a> to run a simple local server.
      </div>
    `)
  }
})
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
  desktopInited: false,
  taskBarHideTitle: false,
  use: 'api',
  api: null,
  static: null
}
// first init for the desktop
function shudesktopInit() {
  if(desktopStatus.desktopInited) throw new Error('Do not init desktop twice!')
  desktopStatus.desktopInited = true

  // set taskbar hiding
  var taskBarTime = 3
  var taskBar = document.getElementById('taskbar')
  var taskBarTimeDropper = setInterval(()=>{
    if(taskBarTime<=0) {
      taskBarTime = 0
      taskBar.style.bottom = '-43px'
    }else {
      taskBarTime --
      taskBar.style.bottom = null
    }
  },1000)
  taskBar.onmouseover = taskBar.onmousemove =()=>{
    taskBarTime = 3
    taskBar.style.bottom = null
  }

  // set START events
  const startDom = document.getElementsByClassName('taskbar_task')[0]
  const startClick = ()=>{
    document.getElementById('start').style.display = 'flex'
    startDom.onclick = ()=>{
      startDom.onclick = startClick
      document.getElementById('start').style.display = 'none'
    }
  }
  startDom.onclick = startClick

  // list desktop icons
  apps.forEach((app)=>{
    let dom = document.createElement('div')
    dom.className = 'desktop_item'
    dom.setAttribute('app', 'shu')
    if(app.id.indexOf('system.')==0) dom.classList.add('system')
    dom.insertAdjacentHTML('afterbegin',`
      <img src="${app.icon}" alt="${app.title}"/>
      <span>${app.title}</span>
    `)
    if(app.solidImg) dom.getElementsByTagName('img')[0].classList.add('solidColor')
    dom.onclick = ()=>{
      let thisApp = new ShuWindow(app.id)
      thisApp.show()
    }
    document.getElementById('desktop').append(dom)
  })
}
// init settings
function shusettingsInit() {
  shuSettings.forEach(item=>{
    item.content.forEach(content=>{
      if(content.status===undefined) return
      if(content.type==='switch')
        new Function(content.switch[content.status])()
      else if(content.type==='palette')
        new Function('palette', content.palette)(content.status)
    })
  })
}

// manager of opened windows
var activeApps = []
/**
 * open a new window. 
 * use `new` to get an object with `dom` and `remove()` etc.
 * @param {string} appid app's id
 * @returns {undefined}
 */
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
    disableButtons: obj.disableButtons || [false, false, false],
    disableResize: obj.disableResize || false,
    width: obj.width || undefined,
    height: obj.height || undefined
  }

  // judge with whether only one process
  if(this.builds.onlyOne) {
    var isReallyOnlyOne = false
    activeApps.forEach((val)=>{
      if(val.appid==obj.id) isReallyOnlyOne = val
    })
    if(isReallyOnlyOne!=false) {
      return isReallyOnlyOne
    }
  }
  
  // get last process id and +1 for this process
  if(activeApps.length==0) this.processId = 0
  else this.processId = activeApps[(activeApps.length - 1)].processId + 1
  activeApps.push(this)

  // set content style
  let style = 'z-index: 0; '
  if(this.builds.height!=undefined) {
    if(typeof(this.builds.height)==='number')
      this.builds.height = this.builds.height.toString() + 'px'
    style += `height: ${this.builds.height};`
  }
  if(this.builds.width!=undefined) {
    if(typeof(this.builds.width)==='number')
      this.builds.width = this.builds.width.toString() + 'px'
    style += `width: ${this.builds.width};`
  }
  // disable maximum while disable resize
  if(this.builds.disableResize)
    this.builds.disableButtons[1] = true
  Object.freeze(this.builds)

  // add properties together to DOM
  document.createDocumentFragment().insert
  this.dom = document.createElement('div')
  this.dom.id = this.builds.title+this.processId
  this.dom.className = 'ShuWindow'
  this.dom.style = style
  this.dom.setAttribute('app', 'shu')
  this.dom.insertAdjacentHTML('afterbegin',`
    <div class="header">
      <img src="${this.builds.icon}" alt="setting" class="solidColor">
      <span></span>
      <div class="buttons">
        <div class="ShuWindow_close button" title="close window"></div>
        <div class="ShuWindow_maximize button" title="maximize window"></div>
        <div class="ShuWindow_hide button" title="hide window"></div>
      </div>
    </div>
    <div class="content"></div>
    <div class="draggers">
      <div class="lt"></div><div class="t"></div><div class="rt"></div>
      <div class="l"></div><div class="r"></div>
      <div class="lb"></div><div class="b"></div><div class="rb"></div>
    </div>
  `)
  this.dom.getElementsByTagName('span')[0].innerText = this.builds.title
  document.getElementById('windows').append(this.dom)

  // set content type.
  if(this.builds.type=='inset') { // inset
    get(this.builds.src,(res)=>{
      const contentBody = this.dom.getElementsByClassName('content')[0]
      contentBody.insertAdjacentHTML('afterbegin',res)
      // run scripts in the app file
      let i = contentBody.getElementsByTagName('script').length
      while (i>0) {
        i--
        const script = new Function('appbody', 'appproc', 
          contentBody.getElementsByTagName('script')[i].innerText
        )
        script(this.dom.getElementsByClassName('content')[0], this)
      }
    })
  }else { // iframe (default)
    const insertContent = ()=>{
      this.dom.getElementsByClassName('content')[0].insertAdjacentHTML('afterbegin',`
        <iframe src="${this.builds.src}"></iframe>
      `)
    };insertContent()
    this.dom.getElementsByClassName('header')[0].insertAdjacentHTML('beforeend',`
      <img src="./asset/system/refresh.svg" alt="refresh window" class="solidColor">
    `)
    this.dom.getElementsByTagName('img')[1].onclick = insertContent
  }

  // disable buttons
  if(this.builds.disableButtons[0])
   this.dom.getElementsByClassName('ShuWindow_close')[0].classList.add('inavailable')
  if(this.builds.disableButtons[1])
   this.dom.getElementsByClassName('ShuWindow_maximize')[0].classList.add('inavailable') 
  if(this.builds.disableButtons[2])
   this.dom.getElementsByClassName('ShuWindow_hide')[0].classList.add('inavailable')

  // display in center
  this.dom.style.left = (document.getElementById('background').clientWidth
  - this.dom.clientWidth) / 2 + 'px'
  this.dom.style.top = (document.getElementById('background').clientHeight
  - this.dom.clientHeight) / 2 + 'px'

  // == + window events + ==
  const domSize = ()=> this.dom.getBoundingClientRect()
  const eventContainer = document
  // drag the window everywhere
  this.headerDrag = (e)=>{
    if(!this.focused) return
    let startPosition = [domSize().left, domSize().top]
    this.dom.getElementsByClassName('content')[0].style.pointerEvents = 'none'
    eventContainer.onmousemove = (ev)=>{
      let currentPosition = [ev.clientX - e.clientX + startPosition[0],
       ev.clientY - e.clientY + startPosition[1]]
      this.dom.style.left = currentPosition[0]+'px'
      this.dom.style.top = currentPosition[1]+'px'
    }
    eventContainer.onmouseup = ()=>{
      this.dom.getElementsByClassName('content')[0].style.pointerEvents = null
      eventContainer.onmousemove = undefined
      eventContainer.onmouseup = undefined
    }
  }
  this.dom.getElementsByClassName('header')[0].onmousedown = this.headerDrag

  // resize the window with 8 edge divs
  const resizeWindow = ()=>{
    const startSize = ()=> [domSize().left, domSize().top, domSize().width, domSize().height]
    const resizer = (el,lockLeft,lockTop,lockWidth,lockHeight)=> {
      return this.dom.getElementsByClassName(el)[0].onmousedown = (e)=>{
        let ss = startSize()
        this.dom.getElementsByClassName('content')[0].style.pointerEvents = 'none'
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
        eventContainer.onmouseup = ()=>{
          this.dom.getElementsByClassName('content')[0].style.pointerEvents = null
          eventContainer.onmousemove = undefined
          eventContainer.onmouseup = undefined
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
  }
  if(!this.builds.disableResize) {
    resizeWindow()
  }else {
    this.dom.getElementsByClassName('draggers')[0].remove()
  }

  // 3 buttons' events
  const maxiButton = this.dom.getElementsByClassName('ShuWindow_maximize')[0]
  // remove / close
  this.remove = ()=>{
    this.dom.remove()
    let thisInArray = activeApps.indexOf(this)
    if(thisInArray==-1) {
      throw new ReferenceError(`process ${this.processId} not found`)
    }else {
      activeApps.splice(thisInArray, 1)
      this.taskBarDom.remove()
      shuEventHandler.appClose(this)
      return `process ${this.processId} removed`
    }
  }
  // maximum
  this.maxi = ()=>{
    this.dom.getElementsByClassName('draggers')[0].style.display = 'none'
    this.dom.getElementsByClassName('header')[0].onmousedown = null
    // use animation
    this.dom.style.transition = 'all 0.2s ease 0s'
    setTimeout(()=>{
      this.dom.style.transition = null
    }, 200)

    const beforeSize = [domSize().left,domSize().top, domSize().width,domSize().height]
    this.dom.style.left = '0'
    this.dom.style.top = '0'
    this.dom.style.width = '100%'
    this.dom.style.height = '100%'
    maxiButton.classList.add('act')

    // hide header autoly
    var hideHeaderTime = 2
    const hideHeader = setInterval(()=>{
      hideHeaderTime --
      if(hideHeaderTime<=0) {
        hideHeaderTime = 0
        this.dom.getElementsByClassName('header')[0].style.height = '3px'
        this.dom.getElementsByClassName('content')[0].style.height = 'calc(100% - 3px)'
      }else {
        this.dom.getElementsByClassName('header')[0].style.height = '30px'
        this.dom.getElementsByClassName('content')[0].style.height = 'calc(100% - 30px)'
      }
    },1000)
    this.dom.getElementsByClassName('header')[0].onmouseover = ()=>{
      hideHeaderTime = 2
      this.dom.getElementsByClassName('header')[0].style.height = '30px'
      this.dom.getElementsByClassName('content')[0].style.height = 'calc(100% - 30px)'
    }

    maxiButton.onclick =
     this.dom.getElementsByClassName('header')[0].ondblclick = ()=>{
      this.dom.style.transition = 'all 0.2s ease 0s'
      setTimeout(()=>{
        this.dom.style.transition = null
      }, 200)
      this.dom.style.left = beforeSize[0] + 'px'
      this.dom.style.top = beforeSize[1] + 'px'
      this.dom.style.width = beforeSize[2] + 'px'
      this.dom.style.height = beforeSize[3] + 'px'
      maxiButton.classList.remove('act')
      this.dom.getElementsByClassName('draggers')[0].style.display = null
      this.dom.getElementsByClassName('header')[0].onmousedown = this.headerDrag
      clearInterval(hideHeader)
      this.dom.getElementsByClassName('header')[0].onmouseover = null

      maxiButton.onclick = this.maxi
      this.dom.getElementsByClassName('header')[0].ondblclick = this.maxi
      shuEventHandler.appMini(this)
    }
    shuEventHandler.appMaxi(this)
  }
  // hide and show
  this.hide = ()=>{
    this.dom.style.display = 'none'
    this.taskBarDom.classList.remove('active','focused')
  }
  this.show = ()=>{
    this.dom.style.display = 'initial'
    this.taskBarDom.classList.add('active')
    this.top()
  }
  if(!this.builds.disableButtons[0]) {
    this.dom.getElementsByClassName('ShuWindow_close')[0].onclick = this.remove
  }
  if(!this.builds.disableButtons[1]) {
    this.dom.getElementsByClassName('header')[0].ondblclick = this.maxi
    maxiButton.onclick = this.maxi
  }
  if(!this.builds.disableButtons[2]) {
    this.dom.getElementsByClassName('ShuWindow_hide')[0].onclick = this.hide
  }
  // make this dom top on the desktop
  this.focused = false
  this.top = ()=>{
    activeApps.forEach((app)=>{
      if(app.dom==this.dom) {
        if(this.focused) return
        app.dom.style.zIndex = '1'
        app.dom.style.opacity = '1'
        app.taskBarDom.classList.add('focused')
        app.focused = true
        app.dom.getElementsByClassName('content')[0].style.pointerEvents = null
        shuEventHandler.appFocused(this)
      }else {
        app.dom.style.zIndex = '0'
        app.dom.style.opacity = '0.7'
        app.taskBarDom.classList.remove('focused')
        app.focused = false
        app.dom.getElementsByClassName('content')[0].style.pointerEvents = 'none'
      }
    })
  }
  this.dom.onmousedown = this.top
  
  // add a div in taskbar
  this.taskBarDom = document.createElement('div')
  this.taskBarDom.classList.add('taskbar_task')
  if(desktopStatus.taskBarHideTitle) this.taskBarDom.classList.add('hideTitle')
  this.taskBarDom.setAttribute('app', 'shu')
  this.taskBarDom.insertAdjacentHTML('afterbegin',`
    <img src="${this.builds.icon}" alt="${this.builds.title}"/>
    <span></span>
  `)
  this.taskBarDom.getElementsByTagName('span')[0].innerText = this.builds.title
  if(this.builds.solid) 
    this.taskBarDom.getElementsByTagName('img')[0].classList.add('solidColor')
  this.taskBarDom.onclick = this.show
  this.taskBarDom.ondblclick = ()=>{
    this.dom.style.left = '0'
    this.dom.style.top = '0'
  }
  document.getElementById('taskbar').append(this.taskBarDom)
  
  // trigger an event
  shuEventHandler.appOpen(this)
}
// set object tag name
ShuWindow.prototype = {
  get [Symbol.toStringTag]() {
    return 'ShuWindow'
  }
}
