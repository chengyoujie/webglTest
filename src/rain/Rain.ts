import { ImageName } from "../App";
import { app } from "../Main";
import { ComUtils } from "../utils/ComUtils";

export class Rain{

    public canvas:HTMLCanvasElement;
    private static Buff_Element = ComUtils.createCanvas(64, 64);
    private static Buff_2dContext:CanvasRenderingContext2D = Rain.Buff_Element.getContext("2d");
    
    public x:number = 0;
    public y:number = 0;
    public size:number = 0;
    /**重力 */
    public momentum:number = 0;
    /**蒸发 缩水*/
    public shrink:number = 0;
    /**上次产卵(子水滴)的位置 */
    public lastSpawn:number = 0;
    /**下次产卵(子水滴)的位置 */
    public nextSpawn:number = 0;
    /**父雨滴，及从哪个雨滴上生成的 */
    public parent:Rain;
    public killed:boolean = false;
    /**是否是新产生的 */
    public isNew = false;
    /**x方向扩展大小 */
    public spreadX = 0;
    /**y方向扩展大小 */
    public spreadY = 0;
    
    public static RAIN_SIZE = 64;
    
    public static count = 0;


    constructor(){
        let s = this;
        Rain.count ++;
        // console.log("生成第 "+Rain.count+" 个新水滴")
        s.killed = false;
        s.isNew = true;
        s.canvas = ComUtils.createCanvas(Rain.RAIN_SIZE, Rain.RAIN_SIZE);
        s.init();
    }

    /**初始化水珠界面 */
    private init(){
        let s = this;
        let rainCtx = s.canvas.getContext("2d");
        let buffCtx = Rain.Buff_2dContext;
        let buffEle = Rain.Buff_Element;
        buffCtx.clearRect(0, 0, Rain.RAIN_SIZE, Rain.RAIN_SIZE);
        //color
        buffCtx.globalCompositeOperation = "source-over";//覆盖
        buffCtx.drawImage(app.getImage(ImageName.RAIN_COLOR_IMG), 0, 0, Rain.RAIN_SIZE, Rain.RAIN_SIZE);
        //blue overlay for depth
        buffCtx.globalCompositeOperation = "screen";//像素被反转，相乘，然后再次反转。 结果是一张较浅的图片
        buffCtx.fillStyle = "rgba(0, 0, 0,1)";//rain Color 图片只有r,g, 没有b, 
        buffCtx.fillRect(0, 0, Rain.RAIN_SIZE, Rain.RAIN_SIZE);
        //alpha
        rainCtx.globalCompositeOperation = "source-over";//覆盖
        rainCtx.drawImage(app.getImage(ImageName.RAIN_ALPHA_IMG), 0, 0, Rain.RAIN_SIZE, Rain.RAIN_SIZE);

        rainCtx.globalCompositeOperation = "source-in";//新图形仅在和目标图层重叠的位置绘制， 其他地方透明
        rainCtx.drawImage(buffEle, 0, 0, Rain.RAIN_SIZE, Rain.RAIN_SIZE);
    }

    /**
     * 设置水珠的基本信息
     * @param x 
     * @param y 
     * @param size 
     * @returns 
     */
    public set(x:number, y:number, size:number){
        let s = this;
        if(s.killed)return;
        s.x = x;
        s.y = y;
        s.size = size;
    }

    /**销毁掉，放到回收池中 */
    public destory(){
        let s = this;
        s.killed = true;
        s.x = 0;
        s.y = 0;
        s.size = 0;
        s.momentum = 0;
        s.shrink = 0;
        s.lastSpawn = 0;
        s.nextSpawn = 0;
        s.spreadX  = 0;
        s.spreadY = 0;
        s.parent = null;

        Rain._rains.push(s);
    }

    /**雨滴的缓存池 */
    private static _rains:Rain[] = [];
    /**
     * 获得新的雨滴
     * @param index 
     * @returns 
     */
    public static getRain(){
        let rain:Rain;
        if(Rain._rains.length>0){
            rain = Rain._rains.pop();
        }else{
            rain = new Rain();
        }
        rain.killed = false;
        rain.isNew = true;
        return rain;
    }
}