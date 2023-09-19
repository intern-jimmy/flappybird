import BaseScene from "./BaseScene";

const PIPES_TO_RENDER = 4;

class PlayScene extends BaseScene {
    
    constructor(config) {
        super('PlayScene', config);
        this.initialPosition = {
            x: 80,
            y: 300
        }
        this.bird = null;
        this.pipes = null;

        this.horizontalDistance = 400

        this.pipeOpeningDistanceRange = [150, 250]; 
        this.pipeSpacingDistanceRange = [250,600];
        this.flapVelocity = 300;

        this.score = 0;
        this.scoreText = '';
        this.paused = false;
    }

    create() {
        super.create();
        this.createBird();
        this.createPipes();
        this.createColliders();

        this.createPause();

        this.createScore();

        this.createInputs();
    }

    createBird(){
        this.bird = this.physics.add.sprite(this.config.startPosition.x, this.config.startPosition.y, 'bird');
        this.bird.body.gravity.y = 600;
        this.bird.setCollideWorldBounds();
    }

    createPipes(){
        this.pipes = this.physics.add.group();
  
        for(let i = 0; i < PIPES_TO_RENDER; i++){
            const upperPipe = this.pipes.create(0, 0, 'pipe')
                .setImmovable(true)
                .setOrigin(0, 1);
            const lowerPipe = this.pipes.create(0, 0, 'pipe')
                .setImmovable(true)
                .setOrigin(0, 0);
            this.placePipe(upperPipe, lowerPipe)
        }

        this.pipes.setVelocityX(-200);
    }

    createColliders(){
        this.physics.add.collider(this.bird, this.pipes, this.gameOver, null, this);
    }

    createScore() {
        this.score = 0;
        const highscore = localStorage.getItem('highscore');
        this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, {fontSize: '32px', fill: '#fff'});
        this.highscore = this.add.text(16, 52, `High Score: ${highscore || 0}`, {fontSize: '32px', fill: '#fff'});
    }

    createPause(){
        const pauseButton = this.add.image(this.config.width - 10, this.config.height -10, 'pause')
            .setInteractive()
            .setScale(3)    
            .setOrigin(1);

            pauseButton.on('pointerdown', () => {
                this.physics.pause();
                this.scene.pause();
            })
    }

    createInputs(){
        this.input.on('pointerdown', this.flap, this);
    }

    checkGameEndCondition(){
        if( this.bird.getBounds().bottom >= this.config.height || this.bird.getBounds().top <= 0) {
            this.gameOver()
        }
    }

    update() {
        this.checkGameEndCondition();

        this.recyclePipes();
    }

    placePipe(upperPipe, lowerPipe) {
        // setup the pipes
        let pipeOpeningDistance = Phaser.Math.Between(...this.pipeOpeningDistanceRange)
        let pipeVerticlePostion = Phaser.Math.Between(0 + 20, this.config.height - 20 - pipeOpeningDistance);
        let horizontalDistance = Phaser.Math.Between(...this.pipeSpacingDistanceRange);
        const rightMostPipeX = this.getRightMostPipe();
    
        upperPipe.x = horizontalDistance + rightMostPipeX;
        upperPipe.y = pipeVerticlePostion;
    
        lowerPipe.x = upperPipe.x;
        lowerPipe.y = upperPipe.y + pipeOpeningDistance;
          
      }

      getRightMostPipe(){
        let maxX = 0;
        this.pipes.getChildren().forEach(function(pipe) {
            maxX = Math.max(pipe.x, maxX);
        });
        return maxX;
      }

      recyclePipes() {
        let tempPipes = [];
      
        this.pipes.getChildren().forEach(pipe => {
          if(pipe.getBounds().right <= 0){
            tempPipes.push(pipe);
            if(tempPipes.length === 2){
              this.placePipe(...tempPipes);
              this.increaseScore();
            }
          }
        })
    }

    flap(){
        this.bird.body.velocity.y = -this.flapVelocity 
      }
      
    gameOver() {
        this.physics.pause();
        this.bird.setTint(0xff0000);

        const highscore = localStorage.getItem('highscore') && parseInt(localStorage.getItem('highscore'), 10);

        if (!highscore || this.score > highscore){
            localStorage.setItem('highscore', this.score)
        }
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.scene.restart();
            },
            loop: false
        });
      }

      increaseScore() {
        this.score++;
        this.scoreText.setText(`Score: ${this.score}`)
      }
}

export default PlayScene;