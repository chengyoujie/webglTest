import "./css/test.css"
import bg2Img from "./res/bg2.jpg";
import bg3Img from "./res/bg3.png";
import { Log } from "./utils/Log";
import { Rain } from "./rain/Rain"
import { app } from "./Main"
import { RainDrop } from "./rain/RainDrop"

export class Test{
    constructor(){

    }
    private dropsGfx:any[] = [];

    start(){
        this.runTest();
    }

    private runTest(){
        let s = this;
        let test = document.getElementById("test");
        test.style.cssText = "display: inline-flex; width:100%";
        //绘制雨滴
        // let dropAlphaImg = app.getImage(ImageName.RAIN_ALPHA_IMG)
        // let dropColorImg = app.getImage(ImageName.RAIN_COLOR_IMG)
        // let dropSize = 120;
        // let dropBuffer = this.createCanvas(dropSize, dropSize);
        // let dropBufferCtx = dropBuffer.getContext("2d");
      
        // let drop = this.createCanvas(dropSize, dropSize);
        // let dropCtx = drop.getContext("2d");

        // dropBufferCtx.clearRect(0, 0, dropSize, dropSize);

        // dropBufferCtx.globalCompositeOperation = "source-over";
        // dropBufferCtx.drawImage(dropColorImg, 0, 0, dropSize, dropSize);

        // dropBufferCtx.globalCompositeOperation = "screen";
        // dropBufferCtx.fillStyle = "rgba(0, 0, 0, 1)";
        // dropBufferCtx.fillRect(0, 0, dropSize, dropSize);

        // dropCtx.globalCompositeOperation = "source-over";
        // dropCtx.drawImage(dropAlphaImg, 0, 0, dropSize, dropSize);

        // dropCtx.globalCompositeOperation = "source-in";
        // dropCtx.drawImage(dropBuffer, 0, 0, dropSize, dropSize);
        let drop = new Rain(12);
        s.drawLine(test);
        test.appendChild(drop.canvas)
        //绘制Rain
        s.drawLine(test);
        let rain = new Rain(100);
        test.appendChild(rain.canvas);
        //绘制清除雨滴的canvas
        s.drawLine(test);
        let clearEle = document.createElement("canvas");
        let clearRainCtx = clearEle.getContext("2d")
        clearRainCtx.fillStyle = "#000";
        clearRainCtx.beginPath();
        clearRainCtx.arc(app.rainSize, app.rainSize, app.rainSize, 0, Math.PI*2);
        clearRainCtx.fill();
        test.appendChild(clearEle);

        //raindrop画布
        s.drawLine(test);
        let rainDrop = new RainDrop(300, 300);
        test.appendChild(rainDrop.canvas)
        //背景图
        s.drawLine(test);
        var img = new Image();
        img.width = 300;
        img.height = 300;
        img.src = bg3Img;
        test.appendChild(img)
    }


      drawLine(context:Element){
        let line = document.createElement("div");
        line.style.cssText = "width: 3px;height: 120px;background-color: #000000;"
        context.appendChild(line);
        return line;
      }


    createCanvas(width,height){
        let canvas=document.createElement("canvas");
        canvas.width=width;
        canvas.height=height;
        return canvas;
      }


    

}