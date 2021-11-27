// import { Log } from "./../utils/Log";

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
