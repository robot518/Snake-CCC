// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;
const PX = 60;
const IMOVE = 100;
// const HEIGHT = 2560;
// const WIDTH = 1440;
const HEIGHT = 900;
const WIDTH = 720;

@ccclass
export default class SnakendBall extends cc.Component {

    @property(cc.Node)
    ndBg: cc.Node = null;

    @property(cc.Node)
    ndSnake: cc.Node = null;

    @property(cc.Node)
    ndBall: cc.Node = null;

    _speed : number = -10000;
    _iScale : number = 1;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.director.getPhysicsManager().enabled = true;   
        cc.director.getPhysicsManager().gravity = cc.v2(0, 0);
        cc.director.getCollisionManager().enabled = true;  
    }

    onDisable () {
        cc.director.getPhysicsManager().enabled = false;
        cc.director.getCollisionManager().enabled = false;
    }

    start () {
        this.initCanvas();
        this.initParas();
        this.initEvent();
        this.initFood();
    }

    update (dt) {
        if (this._isMovable == true) {
            let mx = this.dx*dt,
                my = this.dy*dt;
            this.ndSnake.x += mx;
            this.ndSnake.y += my;
            // this.ndBg.x -= mx;
            // this.ndBg.y -= my;
            var children = this.ndSnake.parent.children;
            let count = children.length;
            var iLen = this._tStep.length;
            if (iLen > 1){
                for (var i = 0; i < count - 1; i++) {
                    var item = children[i+1];
                    var step = this._tStep[i];
                    item.x = step.x;
                    item.y = step.y;
                };
            }
            this._tStep.unshift({x:this.ndSnake.x, y:this.ndSnake.y});
            if (this._tStep.length > this._iSize)
                this._tStep.splice(-1, 1);
        }
        // if (this._isStart && !this.ndSnake.getComponent(cc.RigidBody).awake && !this._isSleep) {
        //     //白球从运动到停止，状态切换时，标记设置为true，并发送白球停止的事件
        //     this._isSleep = true;
        //     this.onSleep();
        // }
        // if (this._iScale == 1 && this.ndSnake.y > 720){
        //     this.ndBg.scale = 0.1;
        //     // this.ndBg.scaleY = 0.1;
        //     this._iScale = 2;
        //     this.ndSnake.scale = 10;
        //     this.ndSnake.setPosition(cc.v2(0,0));
        // }
    }

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

    initParas(){
        this.dx = 0;
        this.dy = 0;
        this._isStart = false;
        this._isSleep = false;
        this._isStop = true;
        this._isMovable = false;
        this._tStep = [];
        this._tFood = [];
        var children = cc.find("food", this.ndBg).children;
        for (var i = 0; i < children.length; i++) {
            var item = children[i];
            item.getComponent("Food").init(this);
            this._tFood.push(item);
        };
    }

    initEvent(){
        var bg = this.ndBg;
        bg.on("touchstart", function (event) {
            if (this._bTouch == true || this._isStop == false)
                return;
            this._bTouch = true;
            let nd = this._isStart == false ? this.ndSnake : this.ndBall;
            this.preX = nd.x;
            this.preY = nd.y;
        }, this)
        bg.on("touchmove", function (event) {
            if (this._isStop == false) return;
            let nd = this._isStart == false ? this.ndSnake : this.ndBall;
            var touch = event.touch;
            var vPre = touch._startPoint;
            var vCur = touch._point;
            var mX = vCur.x - vPre.x;
            var mY = vCur.y - vPre.y;
            nd.x = this.preX + mX;
            nd.y = this.preY + mY;
            var iR2 = PX*PX;
            if (Math.pow(nd.x - this.preX, 2) + Math.pow(nd.y - this.preY, 2) > iR2){
                if (mX != 0){
                    var k = mY/mX;
                    nd.x = mX/Math.abs(mX)*Math.sqrt(iR2/(1+k*k));
                    nd.y = k*nd.x;
                }else{
                    nd.x = 0;
                    nd.y = mY/Math.abs(mY)*PX;
                }
            }
            if (this._isStart == true) {
                this.dx = mX > 0 ? IMOVE : -IMOVE;
                this.dy = mY > 0 ? IMOVE : -IMOVE;
                if (mX == 0) 
                    this.dx = 0;
                if (mY == 0)
                    this.dy = 0;
                var iTemp = (2*IMOVE)/PX;
                this.dx += (nd.x - this.preX)*iTemp;
                this.dy += (nd.y - this.preY)*iTemp;
            }
        }, this)
        bg.on("touchend", function (argument) {
            if (this._isStop == false) return;
            this._bTouch = false;
            if (this._isStart == true) {
                this.ndBall.x = this.preX;
                this.ndBall.y = this.preY;
            }else{
                let pos = this.ndSnake.getPosition().sub(cc.v2(this.preX,this.preY)).normalize();
                this.onShooting(pos);
            }
        }, this)
        bg.on("touchcancel", function (argument) {
            if (this._isStop == false) return;
            this._bTouch = false;
            if (this._isStart == true) {
                this.ndBall.x = this.preX;
                this.ndBall.y = this.preY;
            }
        }, this)
    }

    onShooting(p) {
		if (this._isStop == false) return;
		this._isStop = false;
        this._isStart = true;
		// let collider = this.ndSnake.getComponent(cc.PhysicsCircleCollider);
		// collider.sensor = false;
		// collider.apply();
        this.ndSnake.getComponent(cc.RigidBody).applyForceToCenter(cc.v2(p.x*this._speed, p.y*this._speed),true);
	}
    
    initFood(){
        var iPx = -(WIDTH/2 - this._tFood[0].width/2);
        var iPy = -(HEIGHT/2 - this._tFood[0].width/2);
        var iLX = -2*iPx;
        var iLY = -2*iPy;
        this._iFood = this._tFood.length;
        for (var i = 0; i < this._iFood; i++) {
            var item = this._tFood[i];
            var px = iPx + Math.random()*iLX;
            var py = iPy + Math.random()*iLY;
            item.x = px;
            item.y = py;
            item.active = true;
            var iFood = Math.floor(Math.random()*4) - 1;
            iFood = iFood == 0 ? 1 : iFood;
            iFood = 1;
            item.children[0].getComponent(cc.Label).string = iFood.toString();
            if (iFood == -1)
                item.color = new cc.Color(240, 17, 17);
            else if (iFood == 1)
                item.color = new cc.Color(30, 120, 30);
            else if (iFood == 2)
                item.color = new cc.Color(22, 17, 255);
        };
    }

    AEatFood(iFood){
        this._iSize += iFood;
        // if (this._iSize > 5) this._iSize = 5;
        // this.showSize();
        this.eatFood();
        this.onGrow();
    }

    // BEatFood(iFood){
    //     this._iSizeB += iFood;
    //     if (this._iSizeB > 5) this._iSizeB = 5;
    //     this.showSizeB();
    //     this.eatFood();
    // }

    eatFood(){
        this._iFood--;
        if (this._iFood == 0) this.initFood();
    }

    onGrow(){
        let ball = cc.instantiate(this.ndSnake);
        // ball.setPosition(cc.v2(self.ui.ball.getPosition().x, -462));
        // ball.setPosition(cc.v2(0,0));
        ball.active = false;
        this.ndSnake.parent.addChild(ball);
    }

    // onSleep(){
    //     this._isStop = true;
    //     this.ndBall.parent.active = true;
    //     this._isMovable = true;
    //     let children = this.ndSnake.parent.children;
    //     for (let i = 1; i < children.length; i++) {
    //         const item = children[i];
    //         item.active = true;
    //         item.setPosition(cc.v2(this.ndSnake.x,this.ndSnake.y));
    //     }
    // }
}
