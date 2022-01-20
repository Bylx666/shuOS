var $ = (el)=> document.getElementById(el)
var show = (el1,el2) => {$(el1).style.display="none";$(el2).style.display="initial"}

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
    show('login5','desktop')
  }, 4500);
}

document.ondragstart = ()=>{return false}