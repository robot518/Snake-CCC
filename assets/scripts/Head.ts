const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Prefab)
    bodyPrefab: cc.Prefab = null;

    bodyNum: number = 2;
    sectionLen: number = 25;
    dir: any = null;

    speed: number = 1;
    snakeArray: any = [];
    pointsArray: any = [];

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.color = this.randomColor();
        this.node.setPosition(this.randomPos());
        this.rotateHead(this.node.position);

        this.snakeArray = [];
        this.snakeArray.push(this.node);

        for (let i=1; i<=this.bodyNum; i++)
            this.getNewBody();

        this.dir = null;
        this.pointsArray = [];

        this.iTime = 0;
    }

    start () {

    }

    update (dt) {
        if (this.dir) {
            this.rotateHead(this.dir);
            this.moveSnake(dt);
        }
    }

    randomColor () {
        // get random color
        let red = Math.round(Math.random()*255);
        let green = Math.round(Math.random()*255);
        let blue = Math.round(Math.random()*255);
        return new cc.Color(red, green, blue);
    },

    randomPos () {
        // get random position
        let width = this.node.parent.parent.width;
        let height = this.node.parent.parent.height;
        let x = Math.round(Math.random()*width) - width/2;
        let y = Math.round(Math.random()*height) - height/2;
        return cc.v2(x, y);
    },

    getNewBody () {
        // initialize body or get longer after eating food
        let newBody = cc.instantiate(this.bodyPrefab);
    
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
        this.node.parent.addChild(newBody);
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
