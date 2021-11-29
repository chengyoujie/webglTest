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
    private _program:WebGL;

    start(){
        let webglDiv = < HTMLCanvasElement>document.getElementById("webgl");
        Log.log("test")
        let gl = webglDiv.getContext("webgl")
        gl.viewport(0, 0, webglDiv.width, webglDiv.height);
        this._program = new WebGL(gl, vertexStr, fragmentStr);
        this._program.bindData({
            aPos:[-0.5,0.5, -0.5,-0.5,  0.5,-0.5, 0.5, 0.5],
            aColor:[0.0,0.1,1.0,   1.0,1.0, 1.0,   1.0, 0.0, 0.0, 1.0, 1.0, 0.4],
            uTest:0.1,
            uColor:[0.0, 0.0],
            indexs:[0,1,2,  0,2,3]
        })
        this.update();
    }

    update(){
        const render = ()=>{
            this._program.render();
            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);
    }
}
window.onload = function(){
    let main = new Main();
    main.start();
}