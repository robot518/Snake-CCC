const {ccclass, property} = cc._decorator;

@ccclass
export default class HeadAI extends cc.Component {

    @property(cc.Prefab)
    bodyPrefab: cc.Prefab = null;

    bodyNum: number = 2;
    sectionLen: number = 24;
    dir: any = null;

    speed: number = 2;
    snakeArray: any = [];
    pointsArray: any = [];

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        
    }

    start () {

    }

    update (dt) {
        if (this.dir) {
            this.rotateHead(this.dir);
            this.moveSnake(dt);
        }
    }

    init(){
        let content = this.node.parent.children;
        for (let i = 1; i < content.length; i++) {
            // content[i].removeFromParent ();
            content[i].active = false;
        }
        this.node.active = true;
        this.node.color = this.randomColor();
        this.node.setPosition(this.randomPos());
        this.rotateHead(this.node.position);

        this.snakeArray = [];
        this.snakeArray.push(this.node);

        for (let i=1; i<=this.bodyNum; i++)
            this.getNewBody();

        this.dir = null;
        this.pointsArray = [];
    }

    randomColor () {
        // get random color
        let red = Math.round(Math.random()*255);
        let green = Math.round(Math.random()*255);
        let blue = Math.round(Math.random()*255);
        // return new cc.Color(red, green, blue);
        return new cc.Color(66,66,66);
    },

    randomPos () {
        // get random position
        let width = this.node.parent.parent.width;
        let height = this.node.parent.parent.height;
        let x = Math.round(Math.random()*width) - width/2;
        let y = Math.round(Math.random()*height) - height/2;
        // return cc.v2(x, y);
        return cc.v2(100.5,100.5);
    },

    getNewBody () {
        let content = this.node.parent.children;
        let newBody = null;
        if (this.snakeArray.length >= content.length) {
            newBody = cc.instantiate(this.bodyPrefab);
            this.node.parent.addChild(newBody);
        }else{
            newBody = content[this.snakeArray.length];
            newBody.active = true;
        }
    
        // set new body's position
        if(this.snakeArray.length == 1) {
            let dir = this.node.position.normalize();
            newBody.setPosition(this.node.position.sub(dir.mul(this.sectionLen)));
        }
        else {
            let lastBody = this.snakeArray[this.snakeArray.length-1];
            let lastBOBody = this.snakeArray[this.snakeArray.length-2];
            let dir = lastBOBody.position.sub(lastBody.position).normalize();
            newBody.setPosition(lastBody.position.sub(dir.mul(this.sectionLen)));
        }
        newBody.color = this.node.color;
    
        // add to canvas and snakeArray
        this.snakeArray.push(newBody);
    }

    rotateHead (headPos) {
        // change head's direction
        let angle = cc.v2(1, 0).signAngle(headPos) * 180/Math.PI;
        this.node.angle = angle-90;
        // console.log("angle = ", angle,headPos);
    },

    moveSnake(dt) {
        // move snake
        let dis = this.dir.mul(this.speed);
        this.node.setPosition(this.node.position.add(dis));
        this.pointsArray.push(this.node.position);

        let step = this.sectionLen/this.speed;
        for (let i = 1; i < this.snakeArray.length; i++) {
            if (this.pointsArray.length <= step*i) {
                let lastBody = this.snakeArray[this.snakeArray.length-1];
                let lastBOBody = this.snakeArray[this.snakeArray.length-2];
                let dir = lastBOBody.position.sub(lastBody.position).normalize();
                dis = dir.mul(this.speed);
                this.snakeArray[i].setPosition(this.snakeArray[i].position.add(dis));
            }else{
                this.snakeArray[i].setPosition(this.pointsArray[this.pointsArray.length-step*i]);
            }
        }
        if (this.pointsArray.length > step*(this.snakeArray.length-1)) {
            this.pointsArray.splice(0,1);
        }
    },
}
