import vertexStr from "./shader/common.vert"
import fragmentStr from "./shader/common.frag"
import "./css/test.css"
import { Log } from "./utils/Log";
import { WebGL } from "./webgl/WebGL";
import { GLArray } from "./utils/GLArray";
import { bind } from "./utils/Decorate";
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
        let data = {
            aPos:new GLArray([-0.5,0.5, -0.5,-0.5,  0.5,-0.5, 0.5, 0.5]),
            aColor:new GLArray([0.0,0.1,1.0,   1.0,1.0, 1.0,   1.0, 0.0, 0.0, 1.0, 1.0, 0.4]),
            uTest:0.8,
            uColor:new GLArray([0.0, 1]),
            indexs:new GLArray([0,1,2,  0,2,3])
        }
        this._program.bindData(data);
        // data.aPos.setValue(0.0, 0.0)
        // data.aPos = new GLArray([-0.5,0.1, -0.5,-0.5,  0.5,-0.5, 0.5, 0.5])
        // data.uColor.setValue(1, 0.0);
        // data.uColor.setValue(0, 1.0)

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