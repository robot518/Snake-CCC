// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;
const PX = 60;
const IMOVE = 100;

@ccclass
export default class SnakendBall extends cc.Component {

    @property(cc.Node)
    ndBg: cc.Node = null;

    @property(cc.Node)
    ndBall: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.director.getPhysicsManager().enabled = true;   
        cc.director.getPhysicsManager().gravity = cc.v2(0, 0);
        // cc.director.getCollisionManager().enabled = true;  
    }

    onDisable () {
        cc.director.getPhysicsManager().enabled = false;
        // cc.director.getCollisionManager().enabled = false;
    }

    start () {
        this.initCanvas();
        this.initEvent();
    }

    // update (dt) {}

    initCanvas(){
        var canvas = this.node.getComponent(cc.Canvas);
        var size = canvas.designResolution;
        var cSize = cc.view.getFrameSize();
        let b = false;
        if (cc.sys.os == cc.sys.OS_IOS){ //刘海屏判断
            b = (cSize.width == 414 && cSize.height == 896)||(cSize.width == 375 && cSize.height == 812)||
            (cSize.width == 390 && cSize.height == 844)||(cSize.width == 428 && cSize.height == 926);
        }
        else if((cc.sys.os == cc.sys.OS_ANDROID)){
            b = (cSize.width == 363 && cSize.height == 797);
        }
        if (b){
            canvas.fitWidth = true;
            canvas.fitHeight = true;
        }else if (cSize.width/cSize.height >= size.width/size.height){
            canvas.fitWidth = false;
            canvas.fitHeight = true;
        }else{
            canvas.fitWidth = true;
            canvas.fitHeight = false;
        }
    }

    initEvent(){
        var bg = this.ndBg;
        bg.on("touchstart", function (event) {
            if (this._bTouch == true)
                return;
            this._bTouch = true;
            this.preX = this.ndBall.x;
            this.preY = this.ndBall.y;
        }, this)
        bg.on("touchmove", function (event) {
            var touch = event.touch;
            var vPre = touch._startPoint;
            var vCur = touch._point;
            var mX = vCur.x - vPre.x;
            var mY = vCur.y - vPre.y;
            this.ndBall.x = this.preX + mX;
            this.ndBall.y = this.preY + mY;
            this.dx = mX > 0 ? IMOVE : -IMOVE;
            this.dy = mY > 0 ? IMOVE : -IMOVE;
            if (mX == 0) 
                this.dx = 0;
            if (mY == 0)
                this.dy = 0;
            var iR2 = PX*PX;
            if (Math.pow(this.ndBall.x - this.preX, 2) + Math.pow(this.ndBall.y - this.preY, 2) > iR2){
                if (mX != 0){
                    var k = mY/mX;
                    this.ndBall.x = mX/Math.abs(mX)*Math.sqrt(iR2/(1+k*k));
                    this.ndBall.y = k*this.ndBall.x;
                }else{
                    this.ndBall.x = 0;
                    this.ndBall.y = mY/Math.abs(mY)*PX;
                }
            }
            var iTemp = (2*IMOVE)/PX;
            this.dx += (this.ndBall.x - this.preX)*iTemp;
            this.dy += (this.ndBall.y - this.preY)*iTemp;
        }, this)
        bg.on("touchend", function (argument) {
            this._bTouch = false;
            // this.ndBall.x = this.preX;
            // this.ndBall.y = this.preY;
            let pos = this.ndBall.getPosition().sub(cc.v2(this.preX,this.preY)).normalize();
            this.onSheJi(pos);
        }, this)
        bg.on("touchcancel", function (argument) {
            this._bTouch = false;
            // this.ndBall.x = this.preX;
            // this.ndBall.y = this.preY;
            // this.onSheJi(pos);
        }, this)
    }

    onSheJi(li) {
        this.speed = -100000;
		if (this.isStop == false) {
			return;
		}
		this.isStop = false;
		// let collider = this.ndBall.getComponent(cc.PhysicsCircleCollider);
		// collider.sensor = false;
		// collider.apply();
        this.ndBall.getComponent(cc.RigidBody).applyForceToCenter(cc.v2(li.x*this.speed, li.y*this.speed),true);
	}
}
