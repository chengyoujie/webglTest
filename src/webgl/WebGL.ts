// import { Log } from "./../utils/Log";

import { Matrix2 } from "../math/Matrix2";
import { Matrix3 } from "../math/Matrix3";
import { Matrix4 } from "../math/Matrix4";
import { Vec2 } from "../math/Vec2";
import { Vec3 } from "../math/Vec3";
import { Vec4 } from "../math/Vec4";
import { Log } from "../utils/Log";



export class WebGL{
    /**webGL程序 */
    private _program:WebGLProgram;
    /**gl 对象 */
    private _gl:WebGLRenderingContext;
    /**shader中用到的attribute属性  name需要和bindData中的数据对应 */
    private _attribute:{[name:string]:AttributeData} = {};
    /**索引数组数据 */
    private _indexs:{data:WebGLBuffer, count:number} = {data:null, count:0};
    /**shader 中用到的uniform 属性 */
    private _unifrom:{[name:string]:UniformData} = {};

    constructor(gl:WebGLRenderingContext,vertexShader:string, fragmentShader:string){
        let s = this;
        s._gl = gl;
        this.initProgram(vertexShader,fragmentShader);
    }

    /**初始化程序 */
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

    /**绑定数据 */
    public bindData(renderData:ShaderParamData){
        let s = this;
        let gl = s._gl;
        let activeAttribute = gl.getProgramParameter(s._program, gl.ACTIVE_ATTRIBUTES);
        s._attribute = {};
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
            s._attribute[name] = {location:idx, data:buff, count:count};
            console.log(attribData);
        }
        let unifromNum = gl.getProgramParameter(s._program, gl.ACTIVE_UNIFORMS);
        for(let i=0; i<unifromNum; i++){
            let unifromData = gl.getActiveUniform(s._program, i);
            let name = unifromData.name;
            if(!renderData[name]){
                Log.error("bindData 没有找到Unifrom: "+name+" 对应的数据");
                continue;
            }
            let idx = gl.getUniformLocation(s._program, name);
            s._unifrom[name] = s.getUnifromInfo(unifromData, idx, renderData[name]);
            console.log(unifromData);
        }
        if(renderData.indexs){
            let data = new Uint8Array(renderData.indexs);
            let buff = s.createIndexBuffer(data);
            s._indexs.data = buff;
            s._indexs.count = data.length;
        }
    }

    /**获取Attribute的大小 */
    private getAttributeSize(type:number){
        let gl = this._gl;
        switch(type){
            case gl.FLOAT_VEC2:return 2;
            case gl.FLOAT_VEC3:return 3;
            case gl.FLOAT_VEC4:return 4;
        }
        return 1;
    }

    /**获取Uniform信息 */
    private getUnifromInfo(uniformInfo:WebGLActiveInfo, location:WebGLUniformLocation, data:any){
        let s = this;
        let gl = s._gl;
        let fun:(location:WebGLUniformLocation, ...data)=>void;
        let openParam = true;
        switch(uniformInfo.type){
            case gl.FLOAT:
                fun= gl.uniform1f;
                openParam = false;
                break;
            case gl.FLOAT_VEC2:
                fun=  gl.uniform2f;
                break;
            case gl.FLOAT_VEC3:
                fun=  gl.uniform3f;
                break;
            case gl.FLOAT_VEC4:
                fun=  gl.uniform4f;
                break;
            case gl.INT:
            case gl.BOOL:
            case gl.SAMPLER_2D:
            case gl.SAMPLER_CUBE:
                fun=  gl.uniform1i;
                openParam = false;
                break;
            case gl.INT_VEC2:
            case gl.BOOL_VEC2:
                fun=  gl.uniform2i;
                break;
            case gl.INT_VEC3:
            case gl.BOOL_VEC3:
                fun=  gl.uniform3i;
                break;
            case gl.INT_VEC4:
            case gl.BOOL_VEC4:
                fun=  gl.uniform4i;
                break;
            case gl.FLOAT_MAT2:
                fun=  s.uniformMatrix2fv;
                openParam = false;
                break;
            case gl.FLOAT_MAT2:
                fun=  s.uniformMatrix3fv;
                openParam = false;
                break;
            case gl.FLOAT_MAT2:
                fun=  s.uniformMatrix4fv;
                openParam = false;
                break;
        }
        return {fun:fun, openParam:openParam, location:location, data:data}
    }

    /**包装的unifromMatrix2fv 使其参数成为(location, data)*/
    private uniformMatrix2fv(index:WebGLUniformLocation, data:Float32List){
        this._gl.uniformMatrix2fv(index, false, data);
    }
    
    /**包装的unifromMatrix3fv 使其参数成为(location, data)*/
    private uniformMatrix3fv(index:WebGLUniformLocation, data:Float32List){
        this._gl.uniformMatrix3fv(index, false, data);
    }
    
    /**包装的unifromMatrix4fv 使其参数成为(location, data)*/
    private uniformMatrix4fv(index:WebGLUniformLocation, data:Float32List){
        this._gl.uniformMatrix4fv(index, false, data);
    }

    /**刷新数据 */
    public render(){
        let s = this;
        let gl = s._gl;
        
        gl.useProgram(s._program);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        let activeAttribute = gl.getProgramParameter(s._program, gl.ACTIVE_ATTRIBUTES);
        for(let i=0; i<activeAttribute; i++){
            let attribData = gl.getActiveAttrib(s._program, i);
            let name = attribData.name;
            let data = s._attribute[name];
            gl.bindBuffer(gl.ARRAY_BUFFER, data.data);
            gl.vertexAttribPointer(data.location, data.count, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(data.location);
        }
        let unifromNum = gl.getProgramParameter(s._program, gl.ACTIVE_UNIFORMS);
        for(let i=0; i<unifromNum; i++){
            let unifromData = gl.getActiveUniform(s._program, i);
            let data = s._unifrom[unifromData.name];
            if(data.openParam){
                data.fun.call(gl, data.location, ...data.data);
            }else{
                data.fun.call(gl, data.location, data.data);
            }
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, s._indexs.data);
        gl.drawElements(gl.TRIANGLES, s._indexs.count, gl.UNSIGNED_BYTE, 0);
    }

    /**创建Buffer */
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

    /**创建索引Buffer */
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
    indexs:number[];
    [propName:string]:any
}

/**
 * 顶点数据类型
 */
export interface AttributeData{
    location:number;
    data:WebGLBuffer;
    count:number
}
/**
 * Unfirom变量数据类型
 */
export interface UniformData{
    fun:(location:WebGLUniformLocation, ...data)=>void;
    location:WebGLUniformLocation;
    openParam:boolean;
    data:any
}