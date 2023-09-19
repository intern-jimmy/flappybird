import BaseScene from "./BaseScene";

class ScoreScene extends BaseScene {
    constructor(config){
        super('ScoreScene', {...config, canGoBack: true});
    }

    create() {
        super.create();

        const highScore = localStorage.getItem('highscore');
        this.add.text(...this.screenCenter,`High Score: ${highScore || 0}`, this.fontOptions)
            .setOrigin(0.5);
    }
}

export default ScoreScene;