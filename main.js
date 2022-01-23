var selectable = false

document.ondragstart=(e)=>{e.preventDefault()}
document.onselectstart=(e)=>{if(!selectable)e.preventDefault()}