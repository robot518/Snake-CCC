const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Prefab)
    bodyPrefab: cc.Prefab = null;

    bodyNum: number = 2;
    sectionLen: number = 25;
    dir: any = null;

    time: number = 5;
    speed: number = 5;
    pointsArray: any = [];
    snakeArray: any = [];

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
        // this.speed = this.sectionLen / this.time;
        this.pointsArray = [];
        this.headPointsNum = 0;
    }

    start () {

    }

    update (dt) {
        if (this.dir) {
            this.rotateHead(this.dir);
            this.moveSnake();
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
        let width = this.node.parent.width;
        let height = this.node.parent.height;
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
    
        // new body's color should be same as that of head
        newBody.color = this.node.color;
        // if (this.snakeArray.length >= this.bodyNum)
        //     newBody.curIndex = this.snakeArray[this.snakeArray.length-1].curIndex;
        // else
        //     newBody.curIndex = 0;
    
        // add to canvas and snakeArray
        this.node.parent.addChild(newBody);
        this.snakeArray.push(newBody);

        // this.recordPoints();
    }

    rotateHead (headPos) {
        // change head's direction
        let angle = cc.v2(1, 0).signAngle(headPos) * 180/Math.PI;
        this.node.angle = angle-90;
        // console.log("angle = ", angle,headPos);
    },

    moveSnake() {
        // move snake
        let dis = this.dir.mul(this.speed);
        let pos1 = this.node.position;
        this.node.setPosition(this.node.position.add(dis));
        // this.pointsArray.push(this.node.position);

        // this.headPointsNum += 1;

        for (let i = 1; i < this.snakeArray.length; i++) {
            let pos2 = this.snakeArray[i].position;
            this.snakeArray[i].setPosition(pos1);
            pos1 = pos2;
        }

        // for(let i=1; i<this.snakeArray.length; i++) {
        //     let num = Math.floor((this.pointsArray.length-this.headPointsNum) / (this.snakeArray.length-1) * (this.snakeArray.length-1-i));
        //     this.snakeArray[i].setPosition(this.pointsArray[num+this.snakeArray[i].curIndex]);
        //     this.snakeArray[i].curIndex += 1;
        // }
    },

    recordPoints () {
        // record points between bodies (head is a special body)
        let len = 0;
        let index = 0;
    
        while(len < this.sectionLen) {
            len += this.speed;
    
            let lastBody = this.snakeArray[this.snakeArray.length-1];
            let lastBOBody = this.snakeArray[this.snakeArray.length-2];
            let dir = lastBOBody.position.sub(lastBody.position).normalize();
    
            let pos = lastBody.position.add(dir.mul(len));
            this.pointsArray.splice(index, 0, pos);
            index += 1;
        };
    },
}
