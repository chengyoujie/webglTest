
import "./css/test.css"
import { App } from "./App";

export let app:App;

function onResize(){
    if(app){
        app.resize(window.document.body.clientWidth, window.document.body.clientHeight);
    }
}

window.onload = function(){
    app = new App();
    app.run(<HTMLCanvasElement>document.getElementById("webgl"));
    onResize();
}
window.onresize = onResize;