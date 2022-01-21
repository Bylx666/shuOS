var $ = (el)=> document.getElementById(el)
var show = (el1,el2) => {$(el1).style.display="none";$(el2).style.display="initial"}
var hide = (el) => {$(el).style.display="none"}

$('launcherStart').onclick = ()=>{
  show('desktop','login')
  show('desktop','login1')
  setTimeout(() => {
    show('login1','login2')
  }, 1000);
  setTimeout(() => {
    show('login2','login3')
  }, 2000);
  setTimeout(() => {
    show('login3','login4')
  }, 3000);
  setTimeout(() => {
    show('login4','login5')
  }, 3500);
  setTimeout(() => {
    show('login','home')
    hide('login1');hide('login2');hide('login3');hide('login4');hide('login5')
  }, 4500);
}

document.ondragstart = ()=>{return false}