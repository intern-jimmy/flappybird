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
        this.isPaused = false;

        this.horizontalDistance = 400

        //this.pipeOpeningDistanceRange = [150, 250]; 
        //this.pipeSpacingDistanceRange = [250,600];
        this.flapVelocity = 300;

        this.score = 0;
        this.scoreText = '';
        this.paused = false;

        this.difficulties = {
            'easy': {
                pipeOpeningDistanceRange: [150, 250],
                pipeSpacingDistanceRange: [400, 600],
                flapVelocity: 300
            },
            'medium': {
                pipeOpeningDistanceRange: [150, 200],
                pipeSpacingDistanceRange: [350, 400],
                flapVelocity: 300
            },
            'hard': {
                pipeOpeningDistanceRange: [100, 150],
                pipeSpacingDistanceRange: [300, 350],
                flapVelocity: 300
            }
        }
    }

    create() {
        this.difficulty = 'easy';
        super.create();
        this.createBird();
        this.createPipes();
        this.createColliders();

        this.createPause();

        this.createScore();

        this.createInputs();
        this.listenToEvents();

        this.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('bird', {start: 8, end: 15}),
            frameRate: 12,
            repeat: -1
        });
        this.bird.play('fly')
    }

    createBird(){
        this.bird = this.physics.add.sprite(this.config.startPosition.x, this.config.startPosition.y, 'bird')
            .setScale(3)
            .setFlipX(true)
            .setOrigin(0);
        this.bird.body.gravity.y = 600;
        this.bird.setCollideWorldBounds();

        this.bird.setBodySize(this.bird.width, this.bird.height -8)
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
        this.isPaused = false;
        const pauseButton = this.add.image(this.config.width - 10, this.config.height -10, 'pause')
            .setInteractive()
            .setScale(3)    
            .setOrigin(1);

        pauseButton.on('pointerdown', () => {
            this.isPaused = true;
            this.physics.pause();
            this.scene.pause();
            this.scene.launch('PauseScene');
        });
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
        const difficulty = this.difficulties[this.difficulty];

        console.log(this.config.height - 20 - difficulty.pipeOpeningDistance)

        let pipeOpeningDistance = Phaser.Math.Between(...difficulty.pipeOpeningDistanceRange)
        let pipeVerticlePostion = Phaser.Math.Between(0 + 20, this.config.height - 20 - pipeOpeningDistance);
        let horizontalDistance = Phaser.Math.Between(...difficulty.pipeSpacingDistanceRange);
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
              this.increaseDifficulty();
            }
          }
        })
    }

    flap(){
        if ( this.isPaused){ return; }
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

      listenToEvents(){
        if (this.pauseEvent) { return; }
        this.pauseEvent = this.events.on('resume', () => {
            this.initialTime = 3;
            this.countdownText = this.add.text(...this.screenCenter, `Fly in ${this.initialTime}`, this.fontOptions).setOrigin(0.5);
            this.timedEvent = this.time.addEvent({
                delay: 1000,
                callback: this.countdown,
                callbackScope: this,
                loop: true
            });
        });
      }

      countdown(){
        this.initialTime -= 1;
        this.countdownText.setText(`Fly in ${this.initialTime}`);
        if(this.initialTime <= 0){
            this.isPaused = false;
            this.countdownText.setText('');
            this.physics.resume();
            this.timedEvent.remove();
            
        }
      }

      increaseDifficulty(){
        if ( this.score === 10){
            this.difficulty = 'medium';
        }

        if( this.score === 50) {
            this.difficulty = 'hard';
        }
      }
}

export default PlayScene;