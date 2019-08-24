const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    lab: cc.Label = null;
    _delt: any;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    // update (dt) {}

    onCollisionEnter(other, self) {
        var name = other.name;
        name = name.substring(0, name.indexOf("<"));
        if (name == "A"){
            this.node.active = false;
            this._delt.AEatFood(parseInt(this.lab.string));
        }else if(name == "B"){
            this.node.active = false;
            this._delt.BEatFood(parseInt(this.lab.string));
        }
    }

    init(delt) {
        this._delt = delt;
    }
}
