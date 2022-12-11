const {ccclass, property} = cc._decorator;

@ccclass
export default class Joystick extends cc.Component {

    @property(cc.Node)
    player: cc.Node = null;

    maxSpeed: number = 5;
    canMove: boolean = false;

    // LIFE-CYCLE CALLBACKS:

    
    onLoad () {
        // get joyStickBtn
        this.joyStickBtn = this.node.children[0]; 
    
        // touch event
        this.node.on('touchstart', this.onTouchStart, this);
        this.node.on('touchmove', this.onTouchMove, this);
        this.node.on('touchend', this.onTouchEnd, this);
        this.node.on('touchcancel', this.onTouchCancel, this);
    },
    
    onDestroy() {
        // touch event
        this.node.off('touchstart', this.onTouchStart, this);
        this.node.off('touchmove', this.onTouchMove, this);
        this.node.off('touchend', this.onTouchEnd, this);
        this.node.off('touchcancel', this.onTouchCancel, this);
    }
    

    start () {

    }

    update (dt) {
        // get ratio
        let len = this.joyStickBtn.position.mag();
        let maxLen = this.node.width / 2;
        let ratio = len / maxLen;
     
        // restrict joyStickBtn inside the joyStickPanel
        if (ratio > 1) {
            this.joyStickBtn.setPosition(this.joyStickBtn.position.div(ratio));
            ratio = 1;
        }

        // let dis = this.dir.mul(this.maxSpeed * ratio);
        // this.player.setPosition(this.player.position.add(dis));
    },

    onTouchStart(event) {
        if (!this.canMove) return;
        // when touch starts, set joyStickBtn's position 
        let pos = this.node.convertToNodeSpaceAR(event.getLocation());
        this.joyStickBtn.setPosition(pos);
    },
     
    onTouchMove(event) {
        if (!this.canMove) return;
        // constantly change joyStickBtn's position
        let posDelta = event.getDelta();
        this.joyStickBtn.setPosition(this.joyStickBtn.position.add(posDelta));
        let dir = this.joyStickBtn.position.normalize();
        this.player.getComponent('Head').dir = dir;
    },
     
    onTouchEnd(event) {
        // reset
        this.joyStickBtn.setPosition(cc.v2(0, 0));
    },
     
    onTouchCancel(event) {
        // reset
        this.joyStickBtn.setPosition(cc.v2(0, 0));
    },
}
