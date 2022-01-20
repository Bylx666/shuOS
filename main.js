var $ = (el)=> document.getElementById(el)
var show = (el1,el2) => {$(el1).style.display="none";$(el2).style.display="initial"}

$('launcherStart').onclick = ()=>{
  show('desktop','login')
  show('desktop','login1')
  setTimeout(() => {
    show('login1','login2')
  }, 2000);
  setTimeout(() => {
    show('login2','login3')
  }, 4000);
  setTimeout(() => {
    show('login3','desktop')
    show('login','desktop')
  }, 6000);
}

document.ondragstart = ()=>{return false}