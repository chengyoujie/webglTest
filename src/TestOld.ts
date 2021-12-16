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
import testImg from "./res/bg.jpg";
import ranImg from "./res/raindrop.png";
import dropAlpha from "./res/drop-alpha.png";
import dropColor from "./res/drop-color.png";
const Drop={
    x:0,
    y:0,
    r:0,
    spreadX:0,
    spreadY:0,
    momentum:0,
    momentumX:0,
    lastSpawn:0,
    nextSpawn:0,
    parent:null,
    isNew:true,
    killed:false,
    shrink:0,
  }
export class Test{
    constructor(){

    }
    private dropsGfx:any[] = [];
    private imgDic = {};

    start(){
        
        let imgs = [{name:"bg", src:testImg}, {name:"dropAlpha", src:dropAlpha}, {name:"dropColor", src:dropColor}];
        this.loadImages(imgs).then(()=>{
            this.runTest();
        })


    }

    private runTest(){
        let s = this;
        let test = document.getElementById("test");
        let dropAlphaImg = s.imgDic["dropAlpha"];
        let dropColorImg = s.imgDic["dropColor"];
        let dropSize = 120;
        let dropBuffer = this.createCanvas(dropSize, dropSize);
        let dropBufferCtx = dropBuffer.getContext("2d");

        let drop = this.createCanvas(dropSize, dropSize);
        let dropCtx = drop.getContext("2d");

        dropBufferCtx.clearRect(0, 0, dropSize, dropSize);

        dropBufferCtx.globalCompositeOperation = "source-over";
        dropBufferCtx.drawImage(dropColorImg, 0, 0, dropSize, dropSize);

        dropBufferCtx.globalCompositeOperation = "screen";
        dropBufferCtx.fillStyle = "rgba(0, 0, 0, 1)";
        dropBufferCtx.fillRect(0, 0, dropSize, dropSize);

        dropCtx.globalCompositeOperation = "source-over";
        dropCtx.drawImage(dropAlphaImg, 0, 0, dropSize, dropSize);

        dropCtx.globalCompositeOperation = "source-in";
        dropCtx.drawImage(dropBuffer, 0, 0, dropSize, dropSize);

        test.appendChild(drop)
    }

    drawDrop(ctx,drop){
        if(this.dropsGfx.length>0){
          let x=drop.x;
          let y=drop.y;
          let r=drop.r;
          let spreadX=drop.spreadX;
          let spreadY=drop.spreadY;
    
          let scaleX=1;
          let scaleY=1.5;
    
        //   let d=Math.max(0,Math.min(1,((r-this.options.minR)/(this.deltaR))*0.9));
          let d=Math.max(0,Math.min(1,((r-10)/(30))*0.9));
          d*=1/(((drop.spreadX+drop.spreadY)*0.5)+1);
    
          ctx.globalAlpha=1;
          ctx.globalCompositeOperation="source-over";
            let scale = 1;
          d=Math.floor(d*(this.dropsGfx.length-1));
          ctx.drawImage(
            this.dropsGfx[d],
            (x-(r*scaleX*(spreadX+1)))*scale,
            (y-(r*scaleY*(spreadY+1)))*scale,
            (r*2*scaleX*(spreadX+1))*scale,
            (r*2*scaleY*(spreadY+1))*scale
          );
        }
      }


    createCanvas(width,height){
        let canvas=document.createElement("canvas");
        canvas.width=width;
        canvas.height=height;
        return canvas;
      }


    loadImages(images:{name:string, src:string}[]){
        return Promise.all(
                images.map(
                    (src, i)=>{
                        return this.loadOneImg(images[i]);
                    }
                )
            );
    }

    loadOneImg(info:{name:string, src:string}){
        let s = this;
        return new Promise((resolve:(value:any)=>void, reject:(reason?:any)=>void)=>{
            var img = new Image();
            img.onload = function(){
                s.imgDic[info.name] = img;
               resolve(img);
            }
            img.onerror = function(){
                reject("加载错误"+info.src);
            }
            img.src = info.src;

        })
    }

}