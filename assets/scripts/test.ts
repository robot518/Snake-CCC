// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    target: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        //行不通
        var follow = cc.follow(this.target, cc.rect(0,0, 2000,2000));
        this.node.runAction(follow);
    }

    start () {

    }

    // update (dt) {}
}
