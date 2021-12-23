
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