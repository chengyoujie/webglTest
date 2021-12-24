import { app } from "../Main";
import { ComUtils } from "../utils/ComUtils";
import { Rain } from "./Rain";
/**
 * 雨滴生成器
 * ---绘制
 * 小水滴 生成到dropletCanvas 上不参与相互间的计算
 * 大水滴 及 小水滴的canvas 绘制到 canvas上，
 * ---逻辑
 * 大水滴 存放到rains数组中，参与相互间的计算
 * 小水滴 由droplets中存放的0-255个水滴中找一个绘制到dropletCanvas上
 * 
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
    /**宽度 */
    private _width:number;
    /**高度 */
    private _height:number;
    /**大雨滴的容器 临时容器1与临时容器2 交替赋值 */
    private _rains:Rain[];
    /**大雨滴 临时容器1 */
    private rainsTemplate1:Rain[];
    /**大雨滴 临时容器2 */
    private rainsTemplate2:Rain[];
    /**小雨滴 的模板*/
    private dropletTemplate:Rain;
    /**雨滴的参数 */
    private _options:RainDropOptins;
    /**大雨滴最大与最小的尺寸间隔 */
    private _sizeDelt:number;
    /**水滴显示时的尺寸=size*_showDropSizeMult  用于擦除时 */
    private _showRainSizeMult = 0.20;
    /**水滴在y方向的缩放值 */
    private _rainYScale = 1.5;
    /**触摸点的x位置 */
    private _touchX:number = 0;
    /**触摸点的y位置 */
    private _touchY:number= 0;
    /**触摸点的大小 */
    private _touchSize:number = 0;
    /**模糊滤镜的canvas */
    public blurCanvas:HTMLCanvasElement;
    /**模糊滤镜的2d */
    private _blurCtx:CanvasRenderingContext2D;
    /**模糊区域上次更新的时间 */
    private _blurLastRenderTimes:number = 0;

    constructor(width:number, height:number, options:RainDropOptins){
        let s = this;
        s._width = width;
        s._height = height;
        s._options = options;
        s.canvas = ComUtils.createCanvas(width, height);
        s.canvasCtx = s.canvas.getContext("2d");
        s.dropletCanvas = ComUtils.createCanvas(width, height);
        s.dropletCtx = s.dropletCanvas.getContext("2d");
        s.blurCanvas = ComUtils.createCanvas(width, height);
        s._blurCtx = s.blurCanvas.getContext("2d");
        s.init();
        s.update();
    } 

    private init(){
        let s = this;
        s.rainsTemplate1 = [];
        s.rainsTemplate2 = [];
        s._rains = s.rainsTemplate1;
        s.dropletTemplate = new Rain();
        s._sizeDelt = s._options.rainSize.max - s._options.rainSize.min;
        //画个直径是64*2的黑圆
        s.clearRainCanvas = ComUtils.createCanvas(Rain.RAIN_SIZE*2, Rain.RAIN_SIZE*2);
        let clearRainCtx = s.clearRainCanvas.getContext("2d")
        clearRainCtx.fillStyle = "#000";
        clearRainCtx.beginPath();
        clearRainCtx.arc(Rain.RAIN_SIZE, Rain.RAIN_SIZE, Rain.RAIN_SIZE, 0, Math.PI*2);//x,y,r, startAngle, endAngle
        clearRainCtx.fill();
    }
    /**
     * 重新设置界面的宽高
     * @param width 
     * @param height 
     */
    public resize(width:number, height:number){
        let s = this;
        s.canvasCtx.clearRect(0, 0, s._width, s._height);//将之前的屏幕内容清除
        s._blurCtx.clearRect(0, 0, s._width, s._height);
        s._width = width;
        s._height = height;
        s.canvas.width = width;
        s.canvas.height = height;
        s.dropletCanvas.width = width;
        s.dropletCanvas.height = height;
    }

    public update(){
        let s = this;
        s.canvasCtx.clearRect(0, 0, s._width, s._height);
        s.updateRain();
        requestAnimationFrame(this.update.bind(this));
    }

    public erase(x:number, y:number, size:number){
        let s = this;
        s.eraseCtx(s.dropletCtx, x, y, size, "rgba(0, 0, 0, 1)");
        s.eraseCtx(s._blurCtx, x, y, size, "#000000ff");
        s._touchX = x;
        s._touchY = y;
        s._touchSize = size;
    }

    public endErase(){
        this._touchSize = 0;
    }

    private eraseCtx(ctx:CanvasRenderingContext2D, x:number, y:number, size:number, fillColor:string){
        ctx.beginPath();
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI*2);
        ctx.fill();
    }

    private updateRain(){
        let s = this;
        //更新滤镜显示区域
        if(s._blurLastRenderTimes>8)
        {
            s._blurCtx.globalCompositeOperation = "lighter";
            s._blurCtx.fillStyle = "#000100ff";
            s._blurCtx.fillRect(0, 0, s._width, s._height);
            s._blurLastRenderTimes = 0;
        }
        s._blurLastRenderTimes ++;

        //更新小雨滴的显示
        let dropletCount = s._options.dropletFrameNum;//每帧添加小雨滴的个数 
        let dropletSize = s._options.dropletSize;
        for(let i=0; i<dropletCount; i++){
            this.drawDroplet(s.dropletCtx, ComUtils.random(s._width), ComUtils.random(s._height), ComUtils.random(dropletSize.min, dropletSize.max, (n)=>n*n));
        }
        s.canvasCtx.drawImage(s.dropletCanvas, 0, 0, s._width, s._height);//将dropletCanvas中的图片绘制到canvas中
        //更新大雨滴的显示
        let count = 0;
        let rainLimit = 6;//每次最多出现大雨滴的个数 6
        let newRains = s._rains == s.rainsTemplate1?s.rainsTemplate2:s.rainsTemplate1;
        newRains.length = 0;
        while(ComUtils.random()<=0.1 && count<rainLimit){//随机出现
            count ++;
            if(s._rains.length>s._options.maxRains)break;
            let r = ComUtils.random(s._options.rainSize.min, s._options.rainSize.max, n=>n*n);
            let rain = Rain.getRain();
            rain.set(ComUtils.random(s._width), ComUtils.random(s._height), r);
            s.initMomentum(rain);//初始化 动量
            newRains.push(rain);
        }
        s._rains.sort((a, b)=>{
            let va = (a.y*s._width)+a.x;
            let vb = (b.y*s._height)+b.x;
            return va>vb?1:va==vb?0:-1;
        })
        s._rains.forEach((rain, i)=> {
            if(!rain.killed){
                if(ComUtils.chance((rain.size-s._options.rainSize.min)/s._sizeDelt* 0.1) ){
                    rain.momentum += ComUtils.random(rain.size/s._options.rainSize.max * 10);
                }
                if(rain.size<s._options.rainSize.min && ComUtils.chance(0.05))
                {
                    rain.shrink += 0.01;
                }
                rain.size -= rain.shrink;
                if(s._touchSize>0){
                    let size = rain.size*s._showRainSizeMult;
                    if(rain.x-size>s._touchX-s._touchSize  &&  rain.x+size <s._touchX+s._touchSize
                        && rain.y-size>s._touchY-s._touchSize && rain.y+size<s._touchY+s._touchSize){
                            rain.killed = true;
                            rain.destory(); 
                            return;
                        }
                }
                if(rain.size<=3)
                {
                    rain.killed = true;
                    rain.destory();
                    return;
                }
                rain.lastSpawn += rain.momentum;
                if(rain.lastSpawn > rain.nextSpawn)// && s._options.maxRains>s.rains.length){
                {
                    let trailRain = Rain.getRain();
                    let trailSize = rain.size*ComUtils.random(0.2, 0.5)
                    trailRain.set(
                        rain.x+ComUtils.random(-rain.size, rain.size)*0.1,
                        rain.y-(rain.size*0.01),
                        trailSize
                    )
                    // console.log("生成新的雨滴")
                    s.initMomentum(trailRain);
                    trailRain.parent = rain;
                    newRains.push(trailRain);
                    rain.size = rain.size - trailRain.size * 0.05;
                    rain.lastSpawn = 0;
                    rain.nextSpawn = s._options.rainSize.min/5 + s._options.rainSize.min/2*1/rain.momentum * ComUtils.random(2, 15);//ComUtils.random(s._options.rainSize.min, s._options.rainSize.max)/4 - rain.momentum *2 + (s._options.rainSize.max - rain.size)
                }
            }
            if(rain.momentum>0){
                if(rain.momentum>40)console.log(" momentum : "+rain.momentum)
                rain.y += rain.momentum;
                if(rain.y>s._height+rain.size){
                    rain.killed = true;
                    rain.destory();
                    return;
                }
            }
            let checkCollision = rain.momentum>0 || rain.isNew;
            rain.isNew = false;
            if(checkCollision && rain.killed==false){
                for(let m=i+1; m<s._rains.length; m++){
                    let r2 = s._rains[m];
                    if(r2.y>rain.size/2+rain.y)break;
                    if(r2 != rain && r2.size<rain.size && r2.killed == false && r2.parent != rain && rain.parent != r2){
                        let dis = ComUtils.distance(r2, rain);
                        if(dis < (r2.size + rain.size)* s._showRainSizeMult){
                            if(rain.size>s._options.rainSize.max)rain.size = s._options.rainSize.max;
                            s._rains.splice(m, 1)
                            r2.killed = true;
                            r2.destory();
                        }
                    }
                }
            }
            if(!rain.killed){
                //清除小雨滴
                s.dropletCtx.globalCompositeOperation = "destination-out";
                let showSize = rain.size*s._showRainSizeMult;
                s.dropletCtx.drawImage(s.clearRainCanvas, rain.x-showSize, rain.y-showSize*s._rainYScale, showSize*2, showSize*2*s._rainYScale);
                //显示雨滴
                s.canvasCtx.drawImage(rain.canvas, rain.x-rain.size/2, rain.y-rain.size/2*s._rainYScale, rain.size, rain.size*s._rainYScale);
                newRains.push(rain);
            }else{
                s._rains.splice(i, 1)
                rain.destory();
            }
        }, this);
        s._rains = newRains;
    }
    /**初始化 动量 (每帧下移的位置)*/
    private initMomentum(rain:Rain){
        let s = this;
        rain.momentum = 1+(rain.size-s._options.rainSize.min)*0.1+ComUtils.random(2);
    }

    /**绘制小雨滴 */
    private drawDroplet(ctx:CanvasRenderingContext2D, x:number, y:number, size:number){
        let s = this;
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        let scaleX = 1;
        let scaleY = 1.5;
        ctx.drawImage(s.dropletTemplate.canvas, x-size*scaleX, y-size*scaleY, size*2*scaleX, size*2*scaleY);
    }
}

/**
 * 雨滴生成器参数
 */
export interface RainDropOptins{
    /**大雨滴的大小范围 */
    rainSize:{max:number, min:number},
    /**最多产生多少个大雨滴 */
    maxRains:number,

    /**每帧产生多少个小雨滴 */
    dropletFrameNum:number,
    /**小雨滴的大小范围 */
    dropletSize:{max:number, min:number},

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