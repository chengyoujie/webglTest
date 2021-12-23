import { ComUtils } from "./utils/ComUtils";
import bgImg from "./res/bg.jpg";
import bg2Img from "./res/bg2.jpg";
import bg3Img from "./res/bg3.png";
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
import { Test } from "./Test";
import { app } from "./Main";
import { RainDrop, RainDropOptins } from "./rain/RainDrop";
import { Rain } from "./rain/Rain";


export class App{

    /**主canvas的weggl  */
    private _gl:WebGLRenderingContext;
    /**所有的webgl 程序 */
    private _programs:WebGL[] = [];
    /**初始化时已经加载图片的字典 */
    private imgDic:{[name:string]:HTMLImageElement} = {};
    /**canvas的宽高 [0]=宽度， [1]=高度 */
    private _size:GLArray;
    /**主canvas */
    private _mainCanvas:HTMLCanvasElement;
    /**雨滴生成器 */
    private _rainDrop:RainDrop;
    /**shader的数据类 */
    private _rainShaderData:ShaderParamData;
    
    /**雨滴的参数 */
    private _options:RainDropOptins;



    constructor(){
        let s = this;
        s._size = new GLArray([800, 800]);
        s._options = {
            rainSize:{min:50, max:120},
            maxRains:100,
            dropletSize:{min:2.5, max:5.5},
            dropletFrameNum:20,
        }
    }


    public run(canvas:HTMLCanvasElement){
        let s = this;
        s._mainCanvas = canvas;
        let gl = s._mainCanvas.getContext("webgl");
        this._gl = gl;
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
        let s = this;
        let gl = s._gl;
        s._size.setValue(0, s._mainCanvas.width);
        s._size.setValue(1, s._mainCanvas.height);
        gl.viewport(0, 0, s._mainCanvas.width, s._mainCanvas.height);
        let rainProgram = new WebGL(gl, rainVertexStr, rainFragStr);
        s._rainDrop = new RainDrop(s.width, s.height, s._options);

        let blurProgram = new WebGL(gl, blurVertexStr, blurFragStr);
        let blurData:ShaderParamData = {
            aPos:new GLArray([-1.0,1.0, -1.0,-1.0,  1.0,-1.0, 1.0, 1.0]),
            uBgSampler:bg2Img,
            uSize:s._size,
            indexs:new GLArray([0,1,2,  0,2,3]),
        }
        blurProgram.bindData(blurData);
        blurProgram.enableUseFrameBuffer();
        this._programs.push(blurProgram);
        //雨滴渲染
        this._programs.push(blurProgram);
        s._rainShaderData = {
            aPos:new GLArray([-1.0,1.0, -1.0,-1.0,  1.0,-1.0, 1.0, 1.0]),
            aUv:new GLArray([0.0,1.0, 0.0, 0.0,   1.0, 0.0,  1.0, 1.0]),
            uBgSampler:blurProgram,
            uRainSampler:s._rainDrop.canvas,
            uSize:s._size,
            indexs:new GLArray([0,1,2,  0,2,3])
        }
        rainProgram.bindData(s._rainShaderData);
        this._programs.push(rainProgram);
        this.update();

        //test 测试界面
        // let test = new Test();
        // test.start();
    }
    /**
     * 重新设置界面宽高
     * @param width 
     * @param height 
     */
    public resize(width:number, height:number){
        let s = this;
        s._size.setValue(0, width);
        s._size.setValue(1, height);
        s._mainCanvas.width = s.width;
        s._mainCanvas.height = s.height;
        if(s._gl) s._gl.viewport(0, 0, s.width, s.height);
        if(s._rainDrop)s._rainDrop.resize(s.width,s.height);
        for(let i=0; i<s._programs.length; i++)
        {
            s._programs[i].resize();
        }
    }


    /**刷新界面 */
    private update(){
        let s = this;
        const render = ()=>{
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

    /**界面的宽度 */
    public get width(){return this._size.getValue(0);}
    /**界面的高度 */
    public get height(){return this._size.getValue(1);}
    /**雨滴的参数 */
    public get rainOptions(){return this._options;}

}


export const enum ImageName{
    BG_IMG = "bgImage",
    RAIN_ALPHA_IMG = "dropAlphaImage",
    RAIN_COLOR_IMG = "rainColorImage",
}