import vertexStr from "./shader/common.vert"
import fragmentStr from "./shader/common.frag"
import "./css/test.css"
import { Log } from "./utils/Log";
import { WebGL } from "./webgl/WebGL";
// console.log(txt);
// let web = document.getElementById("webgl")
// if(web)web.innerText = txt;
export class Main{
    constructor(){

    }

    start(){
        let webglDiv = < HTMLCanvasElement>document.getElementById("webgl");
        Log.log("test")
        let gl = webglDiv.getContext("webgl")
        let test = new WebGL(gl, vertexStr, fragmentStr);
        console.log(test)
    }

    update(){

    }
}
window.onload = function(){
    let main = new Main();
    main.start();
}