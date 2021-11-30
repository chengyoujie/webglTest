import { GLArray } from "./GLArray";

export class ComUtils{

    /**绑定数据 */
    public static bindData<T extends Object&{__defineSetter__?:any, __defineGetter__?:any}>(orginData:T, prop:keyof T, listener:(prop:string, newValue:any)=>any, listenerThis:any){
        let hideKey = "_$_"+prop;
        let data = orginData[prop];
        if(data instanceof GLArray)//数组的每一项发生改变
        {
            data.addChangeListener(()=>{
                let old = orginData[hideKey];
                orginData[hideKey] = data;
                listener.call(listenerThis, prop, orginData[hideKey], old);
            }, listenerThis)
        }

        orginData[hideKey] = data;
        orginData.__defineSetter__(prop, function(value){
            let old = orginData[hideKey];
            orginData[hideKey] = value;
            listener.call(listenerThis, prop, orginData[hideKey], old);
        });
        orginData.__defineGetter__(prop, function(){
            let hideKey = "_$_"+prop;
            return orginData[hideKey];
        });
    }
}