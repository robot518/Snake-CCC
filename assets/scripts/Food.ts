const {ccclass, property} = cc._decorator;

@ccclass
export default class Food extends cc.Component {

    @property(cc.Label)
    lab: cc.Label = null;
    _delt: any;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    // update (dt) {}

    onCollisionEnter(other, self) {
        var name = other.node.name;
        // name = name.substring(0, name.indexOf("<"));
        if (name == "head"){
            this.node.active = false;
            this._delt.AEatFood(1);
            other.node.getComponent("Head").getNewBody();
        }else if (name == "headAI"){
            this.node.active = false;
            this._delt.BEatFood(2);
            other.node.getComponent("HeadAI").getNewBody();
        }
    }

    init(delt) {
        this._delt = delt;
    }
}
