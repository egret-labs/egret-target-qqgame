namespace egret.qqgame {

    /**
     * @private
     */
    export class WebDeviceOrientation extends EventDispatcher implements DeviceOrientation {
        private isStart: boolean = false;
        /**
         * @private
         * 
         */
        start() {
            this.isStart = true;
            qq.startDeviceMotionListening({ interval: "normal" })
            qq.onDeviceMotionChange(this.onChange)
        }

        /**
         * @private
         * 
         */
        stop() {
            this.isStart = false;
            qq.stopDeviceMotionListening()
        }

        /**
         * @private
         */
        protected onChange = (e: DeviceOrientationEvent) => {
            if (!this.isStart) {
                return
            }
            let event = new OrientationEvent(Event.CHANGE);
            event.beta = e.beta;
            event.gamma = e.gamma;
            event.alpha = e.alpha;
            this.dispatchEvent(event);
        }
    }
}

egret.DeviceOrientation = egret.qqgame.WebDeviceOrientation;
