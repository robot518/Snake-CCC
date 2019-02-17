const HEIGHT = 1280;
const WIDTH = 720;
const DX = 80;
const PX = 60;
const DT = 0.02;
const DT_A = 3;
const DT_B = 5;
const IMOVE = 100;
const STR = "鼠标/手指在屏幕上滑动的方式控制小白上下左右移动，寻找食物，艰难求生。。。\n\n小青（丧尸）会被200范围内的食物吸引，范围内没食物则原地不动。。。" +
"\n\n饥饿会让生命减少，生命降至0则游戏结束。。。\n\n挑战你的生存极限。。。";

cc.Class({
    extends: cc.Component,

    properties: {
        snakeB: cc.Node,
        snake: cc.Node,
        food: cc.Node,
        ball: cc.Node,
        tips: cc.Node,
        intro: cc.Node,
        orient: cc.Node,
        share: cc.Node,
        labIntro: cc.Label,
        labTime: cc.Label,
        labSize: cc.Label,
        labSizeB: cc.Label,
        sp1: cc.Node,
        sp2: cc.Node,
        sp3: cc.Node,
        bgClip: cc.AudioSource,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
    },

    start () {
        cc.director.getCollisionManager().enabled = true;
        // cc.director.getCollisionManager().enabledDebugDraw = true;
        // var follow = cc.follow(this.snake, cc.rect(-360, -640, 2000,2000));
        // this.node.runAction(follow);

        this.initCanvas();
        this.initParas();
        this.initEvent();
        this.initShow();
        this.playIntro();
    },

    update (dt) {
        if (this._bMove == true){
            this.snake.y += this.dy*dt;
            this.snake.x += this.dx*dt;
            if (this._iDelayTime > 1)
                this.playSnakeB();
            else this._iDelayTime+=dt;
            var iNum = 0;
            var bStop = false;
            if (this.snake.y > HEIGHT/2 - 2*DX - this._iSnake){
                bStop = true;
                iNum = 1;
            } else if (this.snake.y < -(HEIGHT/2 - DX - this._iSnake)){
                bStop = true;
                iNum = 4;
            } else if (this.snake.x > WIDTH/2 - this._iSnake){
                bStop = true;
                iNum = 3;
            } else if (this.snake.x < -(WIDTH/2 - this._iSnake)){
                bStop = true;
                iNum = 2;
            }
            if (bStop == true){
                this.snake.y -= this.dy*dt;
                this.snake.x -= this.dx*dt;
            }

            var children = this.snake.parent.children;
            var iLen = this._tStep.length;
            if (iLen > 1){
                for (var i = 0; i < iLen - 1; i++) {
                    var item = children[i+1];
                    var step = this._tStep[i];
                    item.x = step.x;
                    item.y = step.y;
                };
            }
            this._tStep.unshift({x:this.snake.x, y:this.snake.y});
            if (this._tStep.length > this._iSize)
                this._tStep.splice(-1, 1);

            var childrenB = this.snakeB.parent.children;
            var iLenB = this._tStepB.length;
            if (iLenB > 1){
                for (var i = 0; i < iLenB - 1; i++) {
                    var item = childrenB[i+1];
                    var step = this._tStepB[i];
                    item.x = step.x;
                    item.y = step.y;
                };
            }
            this._tStepB.unshift({x:this.snakeB.x, y:this.snakeB.y});
            if (this._tStepB.length > this._iSizeB)
                this._tStepB.splice(-1, 1);
            this._iTimeA += dt;
            this._iTimeB += dt;
            if (this._iTimeA >= DT_A){
                this._iSize--;
                this.showSize();
                this._iTimeA = 0;
            }
            if (this._iTimeB >= DT_B){
                this._iSizeB--;
                this.showSizeB();
                this._iTimeB = 0;
            }
            if (this._iSize <= 0 || this._iSizeB <= 0 || (this._iDelayTime > 1 && Math.sqrt(Math.pow(this.snake.x - this.snakeB.x, 2) + Math.pow(this.snake.y - this.snakeB.y, 2)) <= PX)){
                this._bStart = false;
                this._bMove = false;
                this._bPlayTime = false;
                this.playSPTips("菜鸡! 存活：" + this.labTime.string);
                this.playSound("lose");
                this.labTime.unschedule(this.coPlayTime);
            }
        }
    },

    AEatFood(iFood){
        this._iSize += iFood;
        if (this._iSize > 5) this._iSize = 5;
        this.showSize();
        this.eatFood();
    },

    BEatFood(iFood){
        this._iSizeB += iFood;
        if (this._iSizeB > 5) this._iSizeB = 5;
        this.showSizeB();
        this.eatFood();
    },

    eatFood(){
        this._iFood--;
        if (this._iFood == 0) this.initFood();
    },

    initCanvas(){
        var canvas = this.node.getComponent(cc.Canvas);
        var size = canvas.designResolution;
        var cSize = cc.view.getFrameSize();
        if (cSize.width/cSize.height >= size.width/size.height){
            canvas.fitWidth = false;
            canvas.fitHeight = true;
        }else{
            canvas.fitWidth = true;
            canvas.fitHeight = false;
        }
        canvas.alignWithScreen();
    },

    initParas(){
        this._iFood = 0;
        this._tStep = [];
        this._tStepB = [];
        this.dx = 0;
        this.dy = 100;
        this._iSnake = this.snake.width/2;
        this._bMove = false;
        this._bStop = false;
        this._iTime = 0;
        this._iDelayTime = 0;
        this._iSize = 5;
        this._iSizeB = 5;
        this._iTimeA = 0;
        this._iTimeB = 0;
        this._iIntro = 0;
        this._bPlayTime = false;
        this._tFood = [];
        this._bStart = false;
        var children = cc.find("food", this.node).children;
        for (var i = 0; i < children.length; i++) {
            var item = children[i];
            item.getComponent("Food").init(this);
            this._tFood.push(item);
        };
        this._iFood = this._tFood.length;
        this.tStr = [];
        this.tStr.push("蛇之大陆爆发了丧尸病毒。。。");
        this.tStr.push("小青感染了丧尸病毒，变成了丧尸。。。");
        this.tStr.push("小白对小青依然不离不弃，艰难求生。。。");
    },

    initEvent(){
        this.share.on("click", function (argument) {
            if (this.tips.opacity < 255) return;
            if (window.wx){
                wx.shareAppMessage({
                    title: "你咋不上天！",
                    imageUrl: canvas.toTempFilePathSync({
                        destWidth: 500,
                        destHeight: 400
                    })
                });
            }
        }, this)
        cc.find("top/mine", this.node).on("click", function (argument) {
           if (window.wx){
                wx.navigateToMiniProgram({
                    appId: 'wx4e23a5ec42c5a796',
                    path: '',
                    extraData: {
                        foo: 'Snake'
                    },
                    envVersion: 'develop',
                        success(res) {
                        // 打开成功
                    console.log("success: ", res);
                    },
                    fail(res){
                        console.log("fail: ", res);
                    },
                })
            }
        }, this)
        var down = cc.find("down", this.node);
        this.intro.on("click", function (argument) {
            if (this._iIntro >= 3){
                this.intro.active = false;
                this.playTips("小青1秒后病变");
                this.scheduleOnce(this.onStart, 1);
                this.bgClip.play();
            }else
                this.playIntro();
        }, this)
        cc.find("start", down).on("click", function (argument) {
           this.onStart();
        }, this)
        cc.find("stop", down).on("click", function (argument) {
            if (this._bStart == false) return;
            var str = this._bStop == true ? "Continue" : "Stop";
            this._bMove = this._bStop;
            this._bStop = !this._bStop;
            this.playTips(str);
            if (this._bPlayTime == true)
                this.labTime.unschedule(this.coPlayTime);
            else
                this.labTime.schedule(this.coPlayTime, 1);
            this._bPlayTime = !this._bPlayTime;
        }, this)
        var bg = cc.find("bg");
        bg.on("touchstart", function (event) {
            if (this._bTouch == true)
                return;
            this._bTouch = true;
            this.preX = this.ball.x;
            this.preY = this.ball.y;
        }, this)
        bg.on("touchmove", function (event) {
            var touch = event.touch;
            var vPre = touch._startPoint;
            var vCur = touch._point;
            var mX = vCur.x - vPre.x;
            var mY = vCur.y - vPre.y;
            this.ball.x = this.preX + mX;
            this.ball.y = this.preY + mY;
            this.dx = mX > 0 ? IMOVE : -IMOVE;
            this.dy = mY > 0 ? IMOVE : -IMOVE;
            if (mX == 0) 
                this.dx = 0;
            if (mY == 0)
                this.dy = 0;
            var iR2 = PX*PX;
            if (Math.pow(this.ball.x - this.preX, 2) + Math.pow(this.ball.y - this.preY, 2) > iR2){
                if (mX != 0){
                    var k = mY/mX;
                    this.ball.x = mX/Math.abs(mX)*Math.sqrt(iR2/(1+k*k));
                    this.ball.y = k*this.ball.x;
                }else{
                    this.ball.x = 0;
                    this.ball.y = mY/Math.abs(mY)*PX;
                }
            }
            var iTemp = (2*IMOVE)/PX;
            this.dx += (this.ball.x - this.preX)*iTemp;
            this.dy += (this.ball.y - this.preY)*iTemp;
        }, this)
        bg.on("touchend", function (argument) {
            this._bTouch = false;
            this.ball.x = this.preX;
            this.ball.y = this.preY;
        }, this)
        bg.on("touchcancel", function (argument) {
            this._bTouch = false;
            this.ball.x = this.preX;
            this.ball.y = this.preY;
        }, this)
    },

    initShow(){
        this.sp1.active = false;
        this.sp2.active = false;
        this.sp3.active = false;
        this.intro.active = true;
        this.labTime.string = "00:00";
        this.showSize();
        for (var i = 0; i < this._tFood.length; i++) {
            this._tFood[i].active = false;
        };
    },

    onStart(){
        this.tips.opacity = 0;
        this._bStart = true;
        this._bStop = false;
        this.snake.x = 0;
        this.snake.y = 0;
        this.snakeB.x = 0;
        this.snakeB.y = 0;
        this._iTimeA = 0;
        this._iTimeB = 0;
        this._iIntro = 0;
        this.dx = 0;
        this.dy = 100;
        this._tStep = [];
        this._tStepB = [];
        var children = this.snake.parent.children;
        var iLen = children.length;
        if (iLen > 5){
            for (var i = 5; i < iLen; i++) {
                children[i].active = false;
            }
        }
        var childrenB = this.snakeB.parent.children;
        var iLenB = childrenB.length;
        if (iLenB > 5){
            for (var i = 5; i < iLenB; i++) {
                childrenB[i].active = false;
            }
        }
        this._bMove = true;
        this._iTime = 0;
        this._iDelayTime = 0;
        this._iSize = 5;
        this.showSize();
        this._iSizeB = 5;
        this.showSizeB();
        this.initFood();
        if (this._bPlayTime == false)
            this.playTime();
    },

    initFood(){
        var iPx = -(WIDTH/2 - this._tFood[0].width/2);
        var iPy = -(HEIGHT/2 - this._tFood[0].width/2 - DX);
        var iLX = -2*iPx;
        var iLY = -2*iPy - DX;
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
            item.children[0].getComponent(cc.Label).string = iFood.toString();
            if (iFood == -1)
                item.color = new cc.Color(240, 17, 17);
            else if (iFood == 1)
                item.color = new cc.Color(30, 120, 30);
            else if (iFood == 2)
                item.color = new cc.Color(22, 17, 255);
        };
    },

    playSnakeB(){
        var tDis = [];
        var dis;
        for (var i = 0; i < this._tFood.length; i++) {
            var food = this._tFood[i];
            if (food.active == false)
                dis = 10000;
            else
                dis = Math.sqrt(Math.pow(food.x - this.snakeB.x, 2) + Math.pow(food.y - this.snakeB.y, 2));
            tDis.push(dis);
        };
        var dis2 = Math.sqrt(Math.pow(this.snake.x - this.snakeB.x, 2) + Math.pow(this.snake.y - this.snakeB.y, 2));
        var iMin = tDis[0];
        var iMinIdx = 0;
        for (var i = 1; i < tDis.length; i++) {
            if (tDis[i] < iMin){
                iMin = tDis[i];
                iMinIdx = i;
            }
        };
        if (iMin > dis2){
            iMin = dis2;
            iMinIdx = -1;
        }
        if (iMin > 200)
            return;
        var food = iMinIdx != -1 ? this._tFood[iMinIdx] : this.snake;
        var disX = food.x - this.snakeB.x;
        var disY = food.y - this.snakeB.y;
        var abX = Math.abs(disX);
        var abY = Math.abs(disY);
        var dx,dy;
        var iMore = 0.12 * this._iSizeB;
        var iMove = 200 * DT + iMore*DT;
        if (disX == 0){
            dx = 0;
            dy = iMove*disY/abY;
        }else if(disY == 0){
            dx = iMove*disX/abX;
            dy = 0;
        }else{
            if (abX > abY){
                dx = iMove*disX/abX;
                dy = dx*disY/disX;
            }else{
                dy = iMove*disY/abY;
                dx = dy*disX/disY;
            }
        }
        this.snakeB.x += dx;
        this.snakeB.y += dy;
    },

    showSize(){
        this.labSize.string = this._iSize.toString();
        var color = this._iSize <= 1 ? cc.Color.RED : cc.Color.BLACK;
        this.labSize.node.color = color;
    },

    showSizeB(){
        this.labSizeB.string = this._iSizeB.toString();
        var color = this._iSizeB <= 1 ? cc.Color.RED : cc.Color.BLACK;
        this.labSizeB.node.color = color;
    },  

    playSPTips(str){
        this.share.active = true;
        var lab = this.tips.children[0];
        lab.getComponent(cc.Label).string = str;
        this.tips.opacity = 255;
    },

    playTips(str){
        this.share.active = false;
        var lab = this.tips.children[0];
        lab.getComponent(cc.Label).string = str;
        this.tips.opacity = 255;
        this.tips.runAction(cc.fadeOut(2));
    },

    playTime(){
        this._bPlayTime = true;
        var self = this;
        this.coPlayTime = function(){
            self.labTime.string = self.getStrTime (++self._iTime);
            if (self._iTime >= 300){
                self._bStart = false;
                self._bMove = false;
                self._bPlayTime = false;
                self.playSound("win");
                self.playSPTips("大神!你赢了");
                self.labTime.unschedule(self.coPlayTime);
            }
        }
        this.labTime.schedule(this.coPlayTime, 1);
    },

    getStrTime(iTime){
        var str = "";
        var time = [];
        time[0] = Math.floor(iTime / 60);
        time[1] = iTime % 60;
        var v;
        for (var i = 0; i < time.length; i++) {
            v = time [i];
            if (v < 10)
                str += "0" + v.toString();
            else
                str += v.toString();
            if (i == 0)
                str += ":";
        }
        return str;
    },

    playIntro(){
        this.labIntro.string = this.tStr[this._iIntro++];
        this.sp1.active = false;
        this.sp2.active = false;
        this.sp3.active = false;
        if (this._iIntro == 1)
            this.sp1.active = true;
        else if (this._iIntro == 2)
            this.sp2.active = true;
        else if (this._iIntro == 3)
            this.sp3.active = true;
    },

    playSound(sName){
        var str = cc.url.raw("resources/audio/" + sName + ".mp3");
        cc.audioEngine.play(str, false, 1);
    },

    onDisable(){
        cc.director.getCollisionManager().enabled = false;
        cc.director.getCollisionManager().enabledDebugDraw = false;
    }
});
