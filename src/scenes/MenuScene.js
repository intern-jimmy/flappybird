import BaseScene from "./BaseScene";

class MenuScene extends BaseScene{

    constructor( config){
        super('MenuScene', config);

        this.menu = [
            {scene: 'PlayScene', text: 'Play'},
            {scene: 'ScoreScene', text: 'Score'},
            {scene: null, text: 'Exit'}
        ]
    }

    create() {
        super.create();
        this.createMenu(this.menu, this.setupMenuEvents.bind(this))
    }

    setupMenuEvents(menuItem){
        const textGameObject = menuItem.textGameObject;
        textGameObject.setInteractive();
        console.log(this);
        textGameObject.on('pointerover', () => {
            textGameObject.setStyle({fill: '#ff0'})
        })
        textGameObject.on('pointerout', () => {
            textGameObject.setStyle({fill: '#fff'})
        })
        textGameObject.on('pointerup', () => {
            textGameObject.setStyle({fill: '#0'})
            menuItem.scene && this.scene.start(menuItem.scene);

            if (menuItem.text === 'Exit') {
                this.game.destroy(true);
            }
        })

    }
}

export default MenuScene;