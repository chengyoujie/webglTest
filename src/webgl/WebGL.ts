// import { Log } from "./../utils/Log";

import { Matrix2 } from "../math/Matrix2";
import { Matrix3 } from "../math/Matrix3";
import { Matrix4 } from "../math/Matrix4";
import { Vec2 } from "../math/Vec2";
import { Vec3 } from "../math/Vec3";
import { Vec4 } from "../math/Vec4";
import { Log } from "../utils/Log";



export class WebGL{
    
    private _program:WebGLProgram;
    private _gl:WebGLRenderingContext;

    constructor(gl:WebGLRenderingContext,vertexShader:string, fragmentShader:string){
        let s = this;
        s._gl = gl;
        this.initProgram(vertexShader,fragmentShader);
    }

    private initProgram(vertexShaderStr:string, fragmentShaderStr:string){
        let s = this;
        s._program = s._gl.createProgram();
        let vertexShader = s.compileShader(ShaderType.VERTEX, vertexShaderStr);
        let fragmentShader = s.compileShader(ShaderType.FRAGMENT, fragmentShaderStr);
        if(!vertexShader || !fragmentShader){
            s._gl.deleteShader(vertexShader);
            s._gl.deleteShader(fragmentShader);
            Log.error("ShaderProgram 初始化失败");
            return;
        }
        s._gl.attachShader(s._program, vertexShader);
        s._gl.attachShader(s._program, fragmentShader);
        s._gl.linkProgram(s._program);
        let status = s._gl.getProgramParameter(s._program, s._gl.LINK_STATUS);
        if(!status){
            let err = s._gl.getProgramInfoLog(s._program);
            Log.error("Shader 链接错误 "+err);
            return;
        }
    }

    /**编译代码 */
    private compileShader(type:ShaderType, source:string){
        let s = this;
        let shader = s._gl.createShader(type);
        if(!shader){
            Log.error("Shader 创建失败");
            return;
        }
        s._gl.shaderSource(shader, source);
        s._gl.compileShader(shader);
        let status = s._gl.getShaderParameter(shader, s._gl.COMPILE_STATUS);
        if(!status){
            let err = s._gl.getShaderInfoLog(shader);
            Log.error("Shader 编译失败"+err);
            s._gl.deleteShader(shader);
            return;
        }
        return shader;
    }

    public bindData(renderData:ShaderParamData){
        let s = this;
        let gl = s._gl;
        let activeAttribute = gl.getProgramParameter(s._program, gl.ACTIVE_ATTRIBUTES);
        let attribute = {};
        for(let i=0; i<activeAttribute; i++){
            let attribData = gl.getActiveAttrib(s._program, i);
            let name = attribData.name;
            if(!renderData[name])
            {
                Log.error("bindData 没有找到Attribute: "+attribData.name+" 对应的数组");
                continue;
            }
            let data = new Float32Array(renderData[name])
            let buff = s.createBuffer(data);
            if(!buff)continue;
            let idx = gl.getAttribLocation(s._program, name);
            let count = s.getAttributeSize(attribData.type);

            gl.useProgram(s._program);
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.bindBuffer(gl.ARRAY_BUFFER, buff);
            gl.vertexAttribPointer(idx, count, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(idx);

            attribute[name] = buff;
            console.log(attribData);
        }
        if(renderData.indexs){
            let data = new Uint8Array(renderData.indexs);
            let buff = s.createIndexBuffer(data);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buff);
            gl.drawElements(gl.TRIANGLES, data.length, gl.UNSIGNED_BYTE, 0);
        }else{

        }
    }

    private getAttributeSize(type:number){
        let gl = this._gl;
        switch(type){
            case gl.FLOAT_VEC2:return 2;
            case gl.FLOAT_VEC3:return 3;
            case gl.FLOAT_VEC4:return 4;
        }
        return 1;
    }

    public render(){
        
    }

    private createBuffer(data:any){
        let s = this;
        let buff = s._gl.createBuffer();
        if(!buff){
            Log.error("Buffer 创建失败");
            return;
        }
        s._gl.bindBuffer(s._gl.ARRAY_BUFFER, buff);
        s._gl.bufferData(s._gl.ARRAY_BUFFER, data, s._gl.STATIC_DRAW);
        return buff;
    }

    private createIndexBuffer(data:any){
        let s = this;
        let buff = s._gl.createBuffer();
        if(!buff){
            Log.error("Index Buffer 创建失败");
            return;
        }
        s._gl.bindBuffer(s._gl.ELEMENT_ARRAY_BUFFER, buff);
        s._gl.bufferData(s._gl.ELEMENT_ARRAY_BUFFER, data, s._gl.STATIC_DRAW);
        return buff;
    }

}
/**
 * Shader的类型
 */
export const enum ShaderType{
    /**顶点着色器 */
    VERTEX = 35633,
    /**片段着色器 */
    FRAGMENT = 35632,
}

export type Vec = Vec2|Vec3|Vec4;
export type Matrix = Matrix2|Matrix3|Matrix4;
export type ShaderDateType = Vec|Matrix|Float32Array|number;
/**
 * Shader 的参数
 */
export interface ShaderParamData{
    // unifrom?:{[key:string]:ShaderDateType},
    // attribute?:number[],
    indexs?:number[];
    [propName:string]:any
}