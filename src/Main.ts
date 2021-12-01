import vertexStr from "./shader/common.vert"
import fragmentStr from "./shader/common.frag"
import blurVertexStr from "./shader/blur.vert"
import blurFragStr from "./shader/blur.frag"
import "./css/test.css"
import { Log } from "./utils/Log";
import { ShaderParamData, WebGL } from "./webgl/WebGL";
import { GLArray } from "./utils/GLArray";
import { bind } from "./utils/Decorate";
import testImg from "./res/bg.jpg"
// import testImg from "./res/sky.jpg"

export class Main{
    constructor(){

    }
    private _program:WebGL;

    start(){
        let webglDiv = < HTMLCanvasElement>document.getElementById("webgl");
        Log.log("test")
        let gl = webglDiv.getContext("webgl")
        gl.viewport(0, 0, webglDiv.width, webglDiv.height);
        // this._program = new WebGL(gl, vertexStr, fragmentStr);
        // let data:ShaderParamData = {
        //     aPos:new GLArray([-1.0,1.0, -1.0,-1.0,  1.0,-1.0, 1.0, 1.0]),
        //     aColor:new GLArray([0.0,0.1,1.0,   1.0,1.0, 1.0,   1.0, 0.0, 0.0, 1.0, 1.0, 0.4]),
        //     aUv:new GLArray([0.0,1.0, 0.0, 0.0,   1.0, 0.0,  1.0, 1.0]),
        //     uTest:0.8,
        //     uSampler:testImg,
        //     uColor:new GLArray([0.0, 0.1, 0.1]),
        //     indexs:new GLArray([0,1,2,  0,2,3])
        // }
        // this._program.bindData(data);
        this._program = new WebGL(gl, blurVertexStr, blurFragStr);
        let data:ShaderParamData = {
            aPos:new GLArray([-1.0,1.0, -1.0,-1.0,  1.0,-1.0, 1.0, 1.0]),
            aUv:new GLArray([0.0,1.0, 0.0, 0.0,   1.0, 0.0,  1.0, 1.0]),
            uSampler:testImg,
            uSize:new GLArray([2160, 998]),
            indexs:new GLArray([0,1,2,  0,2,3])
        }
        this._program.bindData(data);
        

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