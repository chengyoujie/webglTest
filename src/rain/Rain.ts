import { ImageName } from "../App";
import { app } from "../Main";
import { ComUtils } from "../utils/ComUtils";

export class Rain{

    public canvas:HTMLCanvasElement;
    private index:number = 0;
    private static Buff_Element = ComUtils.createCanvas(64, 64);
    private static Buff_2dContext:CanvasRenderingContext2D = Rain.Buff_Element.getContext("2d");
    
    public x:number = 0;
    public y:number = 0;
    public size:number = 0;
    /**重力 */
    public momentum:number = 0;
    /**蒸发 缩水*/
    public shrink:number = 0;
    /**上次产卵的位置 */
    public lastSpawn:number = 0;
    /**下次产卵的位置 */
    public nextSpawn:number = 0;
    /**父雨滴，及从哪个雨滴上生成的 */
    public parent:Rain;
    public killed:boolean = false;
    /**是否是新产生的 */
    public isNew = false;


    constructor(index:number){
        let s = this;
        s.index = index;
        s.killed = false;
        s.isNew = true;
        s.canvas = ComUtils.createCanvas(app.rainSize, app.rainSize);
        s.init();
    }

    private init(){
        let s = this;
        let rainCtx = s.canvas.getContext("2d");
        let buffCtx = Rain.Buff_2dContext;
        let buffEle = Rain.Buff_Element;
        buffCtx.clearRect(0, 0, app.rainSize, app.rainSize);
        //color
        buffCtx.globalCompositeOperation = "source-over";//覆盖
        buffCtx.drawImage(app.getImage(ImageName.RAIN_COLOR_IMG), 0, 0, app.rainSize, app.rainSize);
        //blue overlay for depth
        buffCtx.globalCompositeOperation = "screen";//像素被反转，相乘，然后再次反转。 结果是一张较浅的图片
        buffCtx.fillStyle = "rgba(0, 0, "+s.index+",1)";//rain Color 图片只有r,g, 没有b, 
        buffCtx.fillRect(0, 0, app.rainSize, app.rainSize);
        //alpha
        rainCtx.globalCompositeOperation = "source-over";//覆盖
        rainCtx.drawImage(app.getImage(ImageName.RAIN_ALPHA_IMG), 0, 0, app.rainSize, app.rainSize);

        rainCtx.globalCompositeOperation = "source-in";//新图形仅在和目标图层重叠的位置绘制， 其他地方透明
        rainCtx.drawImage(buffEle, 0, 0, app.rainSize, app.rainSize);
    }

    public reset(x:number, y:number, size:number){
        let s = this;
        s.x = x;
        s.y = y;
        s.size = size;
    }

    public destory(){
        let s = this;
        s.killed = true;
        s.x = 0;
        s.y = 0;
        s.size = 0;
        s.index = 0;
        s.momentum = 0;
        s.shrink = 0;
        s.lastSpawn = 0;
        s.nextSpawn = 0;
        s.parent = null;

        Rain._rains.push(s);
    }


    private static _rains:Rain[] = [];
    public static getRain(index:number){
        let rain:Rain;
        if(Rain._rains.length>0){
            rain = Rain._rains.pop();
            rain.index = index;
        }else{
            rain = new Rain(index);
        }
        rain.killed = false;
        rain.isNew = true;
        return rain;
    }
}