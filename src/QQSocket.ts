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

namespace egret {
    export class QQSocket implements egret.ISocket {
        constructor() {
            this.systemInfo = qq.getSystemInfoSync();
        }
        private onConnect: Function;
        private onClose: Function;
        private onSocketData: Function;
        private onError: Function;
        private thisObject: any;
        public addCallBacks(onConnect: Function, onClose: Function, onSocketData: Function, onError: Function, thisObject: any): void {
            this.onConnect = onConnect;
            this.onClose = onClose;
            this.onSocketData = onSocketData;
            this.onError = onError;
            this.thisObject = thisObject;
        }
        private host: string = "";
        private port: number = 0;
        private systemInfo: qq.ISysInfo
        public connect(host: string, port: number): void {
            this.host = host;
            this.port = port;

            let socketServerUrl = "ws://" + this.host + ":" + this.port;
            qq.connectSocket({
                url: socketServerUrl
            })
            this._bindEvent();
        }

        public connectByUrl(url: string): void {
            qq.connectSocket({
                url: url
            })
            this._bindEvent();
        }
        private _bindEvent(): void {
            qq.onSocketOpen(() => {
                this.onConnect.call(this.thisObject)
            });
            qq.onSocketClose(() => {
                this.onClose.call(this.thisObject)
            })
            qq.onSocketError(() => {
                this.onError.call(this.thisObject)
            })
            qq.onSocketMessage((res) => {
                if (typeof res.data === "string") {
                    this.onSocketData.call(this.thisObject, res.data);
                } else {
                    if(this.systemInfo.platform == 'devtools'){
                        new Response(res.data).arrayBuffer().then((buffer) => {
                            this.onSocketData.call(this.thisObject, buffer);
                        });
                    }else{
                        this.onSocketData.call(this.thisObject, res.data);
                    }
                }
            })
        }
        public send(message: any): void {
            qq.sendSocketMessage({ data: message })
        }
        public close(): void {
            qq.closeSocket()
        }
        public disconnect(): void {
            this.close()
        }

    }
    egret.ISocket = QQSocket;
}
