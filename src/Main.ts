
import "./css/test.css"
import { App } from "./App";

export let app:App;

function onResize(){
    console.log("触发resize");
    if(app){
        app.resize(window.document.body.clientWidth, window.document.body.clientHeight);
    }
}
/**防抖 */
function debounce(func, time){
    var timer = null;
    return function(){
        if(timer != null)clearTimeout(timer);
        timer = setTimeout(func, time);
    }
}

window.onload = function(){
    app = new App();
    app.run(<HTMLCanvasElement>document.getElementById("webgl"));
    onResize();
}

window.onresize = debounce(onResize, 200);

//抹除水滴
var isTouch = false;

function touchStart(touchX, touchY){
    isTouch = true;
    if(app)app.erase(touchX, touchY);
}

function touchMove(touchX, touchY){
    if(!isTouch)return;
    if(app)app.erase(touchX, touchY);
}

function touchEnd(){
    isTouch = false;
    if(app)app.endErase();
}


window.onmousedown = function (e){
    touchStart(e.clientX, e.clientY);
}

window.onmousemove = function(e){
    touchMove(e.clientX, e.clientY);
}

window.onmouseup = function(){
    touchEnd();
}

window.addEventListener("touchstart", (e)=>{
    touchStart(e.touches[0].clientX, e.touches[0].clientY);
})
window.addEventListener("touchmove", (e)=>{
    touchMove(e.touches[0].clientX, e.touches[0].clientY);
})
window.addEventListener("touchend", ()=>{
    touchEnd();
})