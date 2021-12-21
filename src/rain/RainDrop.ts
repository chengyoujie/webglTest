import { app } from "../Main";
import { ComUtils } from "../utils/ComUtils";
import { Rain } from "./Rain";
/**
 * 雨滴生成器
 */
export class RainDrop{
    /**要输出的canvas */
    public canvas:HTMLCanvasElement;
    /**canvas的2d渲染 */
    public canvasCtx:CanvasRenderingContext2D;
    /** 小水滴的canvas */
    private dropletCanvas:HTMLCanvasElement;
    /**小水滴的context2d */
    private dropletCtx:CanvasRenderingContext2D;
    /**清除雨滴的canvas 相当于抹布 */
    private clearRainCanvas:HTMLCanvasElement;

    public width:number;
    public height:number;
    /**雨滴 */
    private rains:Rain[];
    /**小雨滴 */
    private droplets:Rain[];

    private _options:RainDropOptins;
    private _sizeDelt:number;

    constructor(width:number, height:number){
        let s = this;
        s.width = width;
        s.height = height;
        s.canvas = ComUtils.createCanvas(width, height);
        s.canvasCtx = s.canvas.getContext("2d");
        s.dropletCanvas = ComUtils.createCanvas(width, height);
        s.dropletCtx = s.dropletCanvas.getContext("2d");
        s.rains = [];
        s.droplets = [];
        s._options = {
            rainSize:{min:20, max:50},
            maxRains:900,
        }
        s._sizeDelt = s._options.rainSize.max - s._options.rainSize.min;
        s.init();
        s.update();
    }

    private init(){
        let s = this;
        for(let i=0; i<=255; i++){
            let rain = new Rain(i);
            s.droplets.push(rain);
        }
        //画个直径是64*2的黑圆
        s.clearRainCanvas = ComUtils.createCanvas(app.rainSize*2, app.rainSize*2);
        let clearRainCtx = s.clearRainCanvas.getContext("2d")
        clearRainCtx.fillStyle = "#000";
        clearRainCtx.beginPath();
        clearRainCtx.arc(app.rainSize, app.rainSize, app.rainSize, 0, Math.PI*2);//x,y,r, startAngle, endAngle
        clearRainCtx.fill();
    }
    /**
     * 重新设置界面的宽高
     * @param width 
     * @param height 
     */
    public resize(width:number, height:number){
        let s = this;
        s.canvasCtx.clearRect(0, 0, s.width, s.height);//将之前的屏幕内容清除
        s.width = width;
        s.height = height;
        s.canvas.width = width;
        s.canvas.height = height;
        s.dropletCanvas.width = width;
        s.dropletCanvas.height = height;
    }

    public update(){
        let s = this;
        s.canvasCtx.clearRect(0, 0, s.width, s.height);
        s.updateRain();
        requestAnimationFrame(this.update.bind(this));
    }

    private updateRain(){
        let s = this;
        //更新小雨滴的显示
        let rainCounter = 40;//每帧添加小雨滴的个数
        for(let i=0; i<rainCounter; i++){
            this.drawDrop(s.dropletCtx, ComUtils.random(s.width), ComUtils.random(s.height), ComUtils.random(3, 5.5, (n)=>n*n));
        }
        s.canvasCtx.drawImage(s.dropletCanvas, 0, 0, s.width, s.height);
        //更新雨滴的显示
        let count = 0;
        let rainLimit = 5;//每次最多出现的雨滴个数
        while(ComUtils.random()<=0.3 && count<rainLimit){
            count ++;
            let r = ComUtils.random(s._options.rainSize.min, s._options.rainSize.max, n=>n*n);
            if(s.rains.length>s._options.maxRains)break;
            let rain = Rain.getRain(10);
            rain.set(ComUtils.random(s.width), ComUtils.random(s.height), r);
            rain.momentum = 1+(rain.size-s._options.rainSize.min)/s._sizeDelt*0.1+ComUtils.random(2);
            s.rains.push(rain);
        }
        s.rains.sort((a, b)=>{
            let va = (a.y*s.width)+a.x;
            let vb = (b.y*s.height)+b.x;
            return va>vb?1:va==vb?0:-1;
        })
        let newRains = [];
        s.rains.forEach((rain, i)=> {
            if(!rain.killed){
                if(ComUtils.chance((rain.size-s._options.rainSize.min)/s._sizeDelt* 0.1) ){
                    rain.momentum += ComUtils.random(rain.size/s._options.rainSize.max * 4);
                }
                if(rain.size<s._options.rainSize.min)
                {
                    rain.shrink += 0.01;
                }
                rain.size -= rain.shrink;
                if(rain.size<=0)rain.killed = true;
                rain.lastSpawn += 1;
                if(rain.lastSpawn > rain.nextSpawn && s._options.maxRains>s.rains.length){
                    let trailRain = Rain.getRain(5);
                    trailRain.set(
                        rain.x+ComUtils.random(-rain.size, rain.size),
                        rain.y-(rain.size*0.01),
                        rain.size*ComUtils.random(0.2, 0.5)
                    )
                    trailRain.momentum += 1+(trailRain.size-s._options.rainSize.min)/s._sizeDelt*0.1+ComUtils.random(2);
                    trailRain.parent = rain;
                    newRains.push(trailRain);
                    rain.size = rain.size * 0.97;
                    rain.lastSpawn = 0;
                    rain.nextSpawn = ComUtils.random(s._options.rainSize.min, s._options.rainSize.max) + rain.momentum *2 + (s._options.rainSize.max - rain.size)
                }
            }
            if(rain.momentum>0){
                // rain.x += rain.momentum;
                rain.y += rain.momentum;
                if(rain.y>s.height+rain.size){
                    rain.killed = true;
                }
            }
            let checkCollision = rain.momentum>0 || rain.isNew;
            rain.isNew = false;
            if(checkCollision && rain.killed==false){
                for(let m=i+1; m<i+70; m++){
                    if(m>=s.rains.length)break;
                    let r2 = s.rains[m];
                    if(r2 != rain && r2.size<rain.size && r2.killed == false && r2.parent != rain && rain.parent != r2){
                        let dis = ComUtils.distance(r2, rain);
                        if(dis < (r2.size + rain.size)/2){
                            let pi = Math.PI;
                            rain.size = Math.sqrt((r2.size * r2.size * pi + rain.size * rain.size * pi* 0.8 )/pi);
                            if(rain.size>s._options.maxRains)rain.size = s._options.maxRains;
                            rain.momentum += (r2.x - rain.x)* 0.1;
                            r2.killed = true;
                            rain.momentum += 10;
                        }
                    }
                }
            }
            if(!rain.killed){
                //清除小雨滴
                s.dropletCtx.globalCompositeOperation = "destination-out";
                s.dropletCtx.drawImage(s.clearRainCanvas, rain.x-rain.size, rain.y-rain.size, rain.size/2, rain.size/2);
                //显示雨滴
                s.canvasCtx.drawImage(rain.canvas, rain.x, rain.y, rain.size, rain.size);
                newRains.push(rain);
            }else{
                rain.destory();
            }
        }, this);
        s.rains = newRains;
    }

    private drawDrop(ctx:CanvasRenderingContext2D, x:number, y:number, size:number){
        let s = this;
        if(s.droplets.length>0){
            let rang = ComUtils.range((size-s._options.rainSize.min)/s._sizeDelt, 0, 1);
            rang = Math.floor(rang*(s.droplets.length-1));

            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = "source-over";

            let rainImg = s.droplets[rang];
            let scaleX = 1;
            let scaleY = 1.5;
            ctx.drawImage(rainImg.canvas, x-size*scaleX, y-size*scaleY, size*2*scaleX, size*2*scaleY)

        }
    }
}

export interface RainDropOptins{
    /**雨滴的大小范围 */
    rainSize:{max:number, min:number},
    /**最大 */
    maxRains:number,

}
/**
 参考值：
 autoShrink: true
bg: img
collisionBoost: 1
collisionBoostMultiplier: 0.05
collisionRadius: 0.45
collisionRadiusIncrease: 0.0002
dropFallMultiplier: 1
dropletsCleaningRadiusMultiplier: 0.28
dropletsRate: 50
dropletsSize: (2) [3, 5.5]
fg: img
flashBg: null
flashChance: 0
flashFg: null
globalTimeScale: 1
maxDrops: 900
maxR: 50
minR: 20
rainChance: 0.35
rainLimit: 6
raining: true
spawnArea: (2) [-0.1, 0.95]
trailRate: 1
trailScaleRange: (2) [0.25, 0.35]
 */