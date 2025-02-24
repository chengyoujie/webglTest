import "./css/test.css"
import bg2Img from "./res/bg2.jpg";
import bg3Img from "./res/bg3.png";
import { Log } from "./utils/Log";
import { Rain } from "./rain/Rain"
import { app } from "./Main"
import { RainDrop } from "./rain/RainDrop"
import { ComUtils } from "./utils/ComUtils";

export class Test{
    constructor(){

    }
    private dropsGfx:any[] = [];

    start(){
        this.runTest();
    }

    private runTest(){
        let s = this;
        let test = document.createElement("div");
        test.style.cssText = "display: inline-flex;width: 100%;position: absolute;top: 0px;left: 0px;background: red;";
        document.body.appendChild(test);
        // test.style.cssText = "display: inline-flex; width:100%";
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
        let drop = new Rain();
        s.drawLine(test);
        test.appendChild(drop.canvas)
        //绘制Rain
        s.drawLine(test);
        let rain = new Rain();
        test.appendChild(rain.canvas);
        //绘制清除雨滴的canvas
        s.drawLine(test);
        let clearEle = document.createElement("canvas");
        let clearRainCtx = clearEle.getContext("2d")
        clearRainCtx.fillStyle = "#000";
        clearRainCtx.beginPath();
        clearRainCtx.arc(Rain.RAIN_SIZE, Rain.RAIN_SIZE, Rain.RAIN_SIZE, 0, Math.PI*2);
        clearRainCtx.fill();
        test.appendChild(clearEle);

        //raindrop画布
        s.drawLine(test);
        // let rainDrop = new RainDrop(300, 300, app.rainOptions);
        // test.appendChild(rainDrop.canvas)
        //背景图
        s.drawLine(test);
        var img = new Image();
        img.width = 300;
        img.height = 300;
        img.src = bg3Img;
        test.appendChild(img)

        //test reduce
        let cav = ComUtils.createCanvas(200, 200);
        let cavCtx = cav.getContext("2d");
        cavCtx.fillStyle = "#00ff00ff";
        cavCtx.fillRect(0, 0, 200, 200);
        cavCtx.fillStyle = "#000000ff";
        cavCtx.fillRect(20, 20, 40, 40);
        setInterval(()=>{
          cavCtx.globalCompositeOperation = "lighter";
          cavCtx.fillStyle = "#001100ff";
          cavCtx.fillRect(0, 0, 200, 200);
        },500)
        test.appendChild(cav);
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