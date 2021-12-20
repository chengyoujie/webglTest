import { ComUtils } from "./utils/ComUtils";
import bgImg from "./res/bg.jpg";
import bg2Img from "./res/bg2.jpg";
import skyImg from "./res/sky.jpg";
import ranImg from "./res/raindrop.png";
import dropAlphaImg from "./res/drop-alpha.png";
import dropColorImg from "./res/drop-color.png";
import { Log } from "./utils/Log";
import { ShaderParamData, WebGL } from "./webgl/WebGL";
import vertexStr from "./shader/common.vert"
import fragmentStr from "./shader/common.frag"
import blurVertexStr from "./shader/blur.vert"
import blurFragStr from "./shader/blur.frag"
import rainVertexStr from "./shader/rain.vert"
import rainFragStr from "./shader/rain.frag"
import { GLArray } from "./utils/GLArray";
import { Test } from "./TestOld";
import { app } from "./Main";
import { RainDrop } from "./rain/RainDrop";


export class App{

    
    private _gl:WebGLRenderingContext;
    private _programs:WebGL[] = [];
    private imgDic:{[name:string]:HTMLImageElement} = {};
    public width:number = 800;
    public height:number = 800;
    public rainSize = 64;

    constructor(){

    }


    public run(){
        let s = this;
        let imgs = [
            {name:ImageName.BG_IMG, src:bgImg}, 
            {name:ImageName.RAIN_ALPHA_IMG, src:dropAlphaImg}, 
            {name:ImageName.RAIN_COLOR_IMG, src:dropColorImg}
        ];
        ComUtils.loadImages(imgs).then((values:{name:string, img:HTMLImageElement}[])=>{
          for(let i=0; i<values.length; i++)this.imgDic[values[i].name] = values[i].img;
            s.start();
        });
    }

    private start(){
        let webglDiv = < HTMLCanvasElement>document.getElementById("webgl");
        Log.log("test")
        let gl = webglDiv.getContext("webgl");
        this._gl = gl;
        app.width = webglDiv.width;
        app.height = webglDiv.height;
        gl.viewport(0, 0, webglDiv.width, webglDiv.height);
        let rainProgram = new WebGL(gl, rainVertexStr, rainFragStr);
        let rainDrop = new RainDrop(app.width, app.height);
        
        let rainData:ShaderParamData = {
            aPos:new GLArray([-1.0,1.0, -1.0,-1.0,  1.0,-1.0, 1.0, 1.0]),
            aUv:new GLArray([0.0,1.0, 0.0, 0.0,   1.0, 0.0,  1.0, 1.0]),
            uBgSampler:bg2Img,
            uMainSampler:rainDrop.canvas,
            uSize:new GLArray([800, 800]),
            indexs:new GLArray([0,1,2,  0,2,3])
        }
        rainProgram.bindData(rainData);
        this._programs.push(rainProgram);

        this.update();
        //test
        let test = new Test();
        test.start();
    }

    
    private update(){
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


    /**
     * 获取图片的名字
     * @param imgName 
     * @returns 
     */
    public getImage(imgName:ImageName){
        return this.imgDic[imgName];
    }

}


export const enum ImageName{
    BG_IMG = "bgImage",
    RAIN_ALPHA_IMG = "dropAlphaImage",
    RAIN_COLOR_IMG = "rainColorImage",
}