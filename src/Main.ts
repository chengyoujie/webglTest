import vertexStr from "./shader/common.vert"
import fragmentStr from "./shader/common.frag"
import blurVertexStr from "./shader/blur.vert"
import blurFragStr from "./shader/blur.frag"
import rainVertexStr from "./shader/rain.vert"
import rainFragStr from "./shader/rain.frag"
import "./css/test.css"
import { Log } from "./utils/Log";
import { ShaderParamData, WebGL } from "./webgl/WebGL";
import { GLArray } from "./utils/GLArray";
import { bind } from "./utils/Decorate";
import bgImg from "./res/bg.jpg";
import skyImg from "./res/sky.jpg";
import ranImg from "./res/raindrop.png";
import dropAlpha from "./res/drop-alpha.png";
import dropColor from "./res/drop-color.png";
import { Test } from "./TestOld"

export class Main{
    private _gl:WebGLRenderingContext;
    constructor(){

    }
    private _programs:WebGL[] = [];

    start(){
        let webglDiv = < HTMLCanvasElement>document.getElementById("webgl");
        Log.log("test")
        let gl = webglDiv.getContext("webgl");
        this._gl = gl;
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
        let bgProgram = new WebGL(gl, blurVertexStr, blurFragStr);
        let data:ShaderParamData = {
            aPos:new GLArray([-1.0,1.0, -1.0,-1.0,  1.0,-1.0, 1.0, 1.0]),
            aUv:new GLArray([0.0,1.0, 0.0, 0.0,   1.0, 0.0,  1.0, 1.0]),
            uSampler:bgImg,
            uSize:new GLArray([2160, 998]),
            indexs:new GLArray([0,1,2,  0,2,3])
        }
        bgProgram.bindData(data);
        // this._programs.push(bgProgram);
        
        let rainProgram = new WebGL(gl, rainVertexStr, rainFragStr);
        let rainData:ShaderParamData = {
            aPos:new GLArray([-1.0,1.0, -1.0,-1.0,  1.0,-1.0, 1.0, 1.0]),
            aUv:new GLArray([0.0,1.0, 0.0, 0.0,   1.0, 0.0,  1.0, 1.0]),
            uBgSampler:bgImg,
            uMainSampler:ranImg,
            uSize:new GLArray([800, 800]),
            indexs:new GLArray([0,1,2,  0,2,3])
        }
        rainProgram.bindData(rainData);
        this._programs.push(rainProgram);

        this.update();


    }


    update(){
        let s = this;
        let gl = s._gl;
        const render = ()=>{
            // gl.clearColor(0, 0, 0, 1);
            // gl.clear(gl.COLOR_BUFFER_BIT);
            gl.enable(gl.BLEND);
            // if(s._indexs.count<3)
            // gl.blendFunc(gl.SRC_ALPHA,gl.DST_COLOR);
            // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
            for(let i=0; i<s._programs.length; i++)
            {
                s._programs[i].render();
            }
            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);
    }
}
window.onload = function(){
    let main = new Main();
    main.start();
    //test
    let test = new Test();
    test.start();
}