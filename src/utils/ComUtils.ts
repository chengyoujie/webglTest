export class ComUtils{

    /**绑定数据 */
    public static bindData<T extends Object&{__defineSetter__?:any, __defineGetter__?:any}>(orginData:T, prop:keyof T, listener:(prop:string, newValue:any, oldValue:any)=>any, listenerThis:any){
        let hideKey = "_$_"+prop;
        orginData[hideKey] = orginData[prop];
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