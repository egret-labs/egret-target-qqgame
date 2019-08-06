//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

namespace egret.qqgame {
    /**
     * @private  
     */
    export enum WEBGL_ATTRIBUTE_TYPE {
        FLOAT_VEC2 = 0x8B50,
        FLOAT_VEC3 = 0x8B51,
        FLOAT_VEC4 = 0x8B52,
        FLOAT = 0x1406,
        BYTE = 0xffff,
        UNSIGNED_BYTE = 0x1401,
        UNSIGNED_SHORT = 0x1403
    }
     /**
     * @private  
     */
    export enum WEBGL_UNIFORM_TYPE {
        FLOAT_VEC2 = 0x8B50,
        FLOAT_VEC3 = 0x8B51,
        FLOAT_VEC4 = 0x8B52,
        INT_VEC2 = 0x8B53,
        INT_VEC3 = 0x8B54,
        INT_VEC4 = 0x8B55,
        BOOL = 0x8B56,
        BOOL_VEC2 = 0x8B57,
        BOOL_VEC3 = 0x8B58,
        BOOL_VEC4 = 0x8B59,
        FLOAT_MAT2 = 0x8B5A,
        FLOAT_MAT3 = 0x8B5B,
        FLOAT_MAT4 = 0x8B5C,
        SAMPLER_2D = 0x8B5E,
        SAMPLER_CUBE = 0x8B60,
        BYTE = 0xffff,
        UNSIGNED_BYTE = 0x1401,
        SHORT = 0x1402,
        UNSIGNED_SHORT = 0x1403,
        INT = 0x1404,
        UNSIGNED_INT = 0x1405,
        FLOAT = 0x1406
    }
    /*
    * 覆盖掉系统的 createCanvas
    */
    function mainCanvas(width?: number, height?: number): HTMLCanvasElement {
        return window['canvas'];
    }
    egret.sys.mainCanvas = mainCanvas;

    function createCanvas(width?: number, height?: number): HTMLCanvasElement {
        let canvas: HTMLCanvasElement = document.createElement("canvas");
        if (!isNaN(width) && !isNaN(height)) {
            canvas.width = width;
            canvas.height = height;
        }
        return canvas;
    }
    egret.sys.createCanvas = createCanvas;


    /*
    * 覆盖掉系统的 resizeContext
    */
    export function resizeContext(renderContext: egret.sys.RenderContext, width: number, height: number, useMaxSize?: boolean): void {
        if (!renderContext) {
            return;
        }
        const webglrendercontext = <WebGLRenderContext>renderContext;
        let surface = webglrendercontext.surface;
        if (useMaxSize) {
            if (surface.width < width) {
                surface.width = width;
                if (!qqgame.isSubContext && window["sharedCanvas"]) {
                    window["sharedCanvas"].width = width;
                }
            }
            if (surface.height < height) {
                surface.height = height;
                if (!qqgame.isSubContext && window["sharedCanvas"]) {
                    window["sharedCanvas"].height = height;
                }
            }
        }
        else {
            if (surface.width !== width) {
                surface.width = width;
                if (!qqgame.isSubContext && window["sharedCanvas"]) {
                    window["sharedCanvas"].width = width;
                }
            }
            if (surface.height !== height) {
                surface.height = height;
                if (!qqgame.isSubContext && window["sharedCanvas"]) {
                    window["sharedCanvas"].height = height;
                }
            }
        }
        webglrendercontext.onResize();
    }
    egret.sys.resizeContext = resizeContext;



    /**
     * sys.getContextWebGL
     */
    function getContextWebGL(surface: HTMLCanvasElement): WebGLRenderingContext {
        return surface ? surface.getContext('webgl') : null;
    }
    egret.sys.getContextWebGL = getContextWebGL;
    /**
     * sys.getContext2d
     */
    export function getContext2d(surface: HTMLCanvasElement): CanvasRenderingContext2D {
        return surface ? surface.getContext('2d') : null;
    }
    egret.sys.getContext2d = getContext2d;

    /**
     * 覆盖掉系统的createTexture
     */
    function createTexture(renderContext: egret.sys.RenderContext, bitmapData: BitmapData): WebGLTexture {
        const webglrendercontext = <WebGLRenderContext>renderContext;
        const gl: any = webglrendercontext.context;
        if ((bitmapData as any).isCanvas && gl.wxBindCanvasTexture) {
            return bitmapData;
        }
        const texture = gl.createTexture();
        if (!texture) {
            //先创建texture失败,然后lost事件才发出来..
            webglrendercontext.contextLost = true;
            return null;
        }
        texture.glContext = gl;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
        texture[UNPACK_PREMULTIPLY_ALPHA_WEBGL] = true;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmapData);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        if (bitmapData.source) {
            bitmapData.source.src = "";
        }
        return texture;
    }
    egret.sys.createTexture = createTexture;
    /**
     * 覆盖掉系统的createTexture
     */
    function _createTexture(renderContext: egret.sys.RenderContext, width: number, height: number, data: any): WebGLTexture {
        const webglrendercontext = <WebGLRenderContext>renderContext;
        const gl = webglrendercontext.context as WebGLRenderingContext;
        const texture: WebGLTexture = gl.createTexture() as WebGLTexture;
        if (!texture) {
            //先创建texture失败,然后lost事件才发出来..
            webglrendercontext.contextLost = true;
            return null;
        }
        //
        texture[glContext] = gl;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return texture;
    }
    egret.sys._createTexture = _createTexture;

    /**
    * 覆盖掉系统的drawTextureElements
    **/
    function drawTextureElements(renderContext: egret.sys.RenderContext, data: any, offset: number): number {
        const webglrendercontext = <WebGLRenderContext>renderContext;
        const gl: any = webglrendercontext.context;
        gl.activeTexture(gl.TEXTURE0);
        if (data.texture.isCanvas) {
            gl.wxBindCanvasTexture(gl.TEXTURE_2D, data.texture);
        } else {
            gl.bindTexture(gl.TEXTURE_2D, data.texture);
        }
        const size = data.count * 3;
        gl.drawElements(gl.TRIANGLES, size, gl.UNSIGNED_SHORT, offset * 2);
        return size;
    }
    egret.sys.drawTextureElements = drawTextureElements;

    /**
     * 测量文本的宽度
     * @param context 
     * @param text 
     */
    function measureTextWith(context: CanvasRenderingContext2D, text: string): number {
        const metrics = context.measureText(text);
        if (!metrics) {
            egret.warn(`wxcontext.measureText result is null or undefined;text is ${text}; font is ${context.font}`)
            return 1;
        }
        return metrics.width;
    }
    egret.sys.measureTextWith = measureTextWith;

    /**
     * 为CanvasRenderBuffer创建一个HTMLCanvasElement
     * @param defaultFunc 
     * @param width 
     * @param height 
     * @param root 
     */
    function createCanvasRenderBufferSurface(defaultFunc: (width?: number, height?: number) => HTMLCanvasElement, width?: number, height?: number, root?: boolean): HTMLCanvasElement {
        if (root) {
            if (qqgame.isSubContext) {
                return window["sharedCanvas"];
            }
            else {
                return window["canvas"];
            }
        }
        else {
            return defaultFunc(width, height);
        }
    }
    egret.sys.createCanvasRenderBufferSurface = createCanvasRenderBufferSurface;

    /**
     * 改变渲染缓冲的大小并清空缓冲区
     * @param renderContext 
     * @param width 
     * @param height 
     * @param useMaxSize 
     */
    function resizeCanvasRenderBuffer(renderContext: egret.sys.RenderContext, width: number, height: number, useMaxSize?: boolean): void {
        let canvasRenderBuffer = <CanvasRenderBuffer>renderContext;
        let surface = canvasRenderBuffer.surface;
        if (qqgame.isSubContext) {
            return;
        }
        if (useMaxSize) {
            let change = false;
            if (surface.width < width) {
                surface.width = width;
                if (Capabilities.renderMode === 'canvas') {
                    window["sharedCanvas"].width = width;
                }
                change = true;
            }
            if (surface.height < height) {
                surface.height = height;
                if (Capabilities.renderMode === 'canvas') {
                    window["sharedCanvas"].height = height;
                }
                change = true;
            }
            //尺寸没有变化时,将绘制属性重置
            if (!change) {
                canvasRenderBuffer.context.globalCompositeOperation = "source-over";
                canvasRenderBuffer.context.setTransform(1, 0, 0, 1, 0, 0);
                canvasRenderBuffer.context.globalAlpha = 1;
            }
        }
        else {
            if (surface.width != width) {
                surface.width = width;
                if (Capabilities.renderMode === 'canvas') {
                    window["sharedCanvas"].width = width;
                }
            }
            if (surface.height != height) {
                surface.height = height;
                if (Capabilities.renderMode === 'canvas') {
                    window["sharedCanvas"].height = height;
                }
            }
        }
        canvasRenderBuffer.clear();
    }
    egret.sys.resizeCanvasRenderBuffer = resizeCanvasRenderBuffer;

    egret.Geolocation = egret.qqgame.WebGeolocation;
    egret.Motion = egret.qqgame.WebMotion;
}
if(window["sharedCanvas"]){
    window["sharedCanvas"].isCanvas = true;
}

