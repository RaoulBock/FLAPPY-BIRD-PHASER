class FlappyBird extends Phaser.Scene {
    constructor() {
      super('FlappyBird');
    }
  
    preload() {
      this.load.image('bird', 'assets/bird.png');
      this.load.image('pipe', 'assets/pipe.png');
      this.load.image('background', 'assets/background.png');
    }
  
    create() {
      // Add background
      this.add.image(240, 320, 'background');
  
      // Create bird with physics and gravity
      this.bird = this.physics.add.sprite(100, 320, 'bird').setScale(0.5);
      this.bird.setGravityY(600);
  
      // Input: flap on space key or pointer down
      this.input.keyboard.on('keydown-SPACE', this.flap, this);
      this.input.on('pointerdown', this.flap, this);
  
      // Group to hold pipes
      this.pipes = this.physics.add.group();
  
      // Timer event to add pipes every 1.5 seconds
      this.pipeTimer = this.time.addEvent({
        delay: 1500,
        callback: this.addPipeRow,
        callbackScope: this,
        loop: true,
      });
  
      // Score tracking
      this.score = 0;
      this.scoreText = this.add.text(20, 20, 'Score: 0', {
        fontSize: '24px',
        fill: '#fff',
        fontFamily: 'Arial',
      });
  
      // Collision detection between bird and pipes
      this.physics.add.collider(this.bird, this.pipes, this.hitPipe, null, this);
  
      // Game over flag
      this.isGameOver = false;
    }
  
    update() {
      if (this.isGameOver) {
        this.bird.setVelocityY(0);
        return;
      }
  
      // If bird goes off screen
      if (this.bird.y > 640 || this.bird.y < 0) {
        this.gameOver();
      }
  
      // Rotate bird for effect
      if (this.bird.body.velocity.y < 0) {
        this.bird.setAngle(-15);
      } else if (this.bird.body.velocity.y >= 0) {
        this.bird.setAngle(15);
      }
  
      // Increase score when pipes pass bird
      this.pipes.getChildren().forEach(pipe => {
        if (!pipe.passed && pipe.x + pipe.width < this.bird.x) {
          pipe.passed = true;
          this.score += 0.5; // because pipes are in pairs, each pair gives 1 point
          this.scoreText.setText('Score: ' + Math.floor(this.score));
        }
  
        // Destroy pipes off screen
        if (pipe.x < -pipe.width) {
          this.pipes.remove(pipe, true, true);
        }
      });
    }
  
    flap() {
      if (this.isGameOver) return;
      this.bird.setVelocityY(-250);
    }
  
    addPipeRow() {
      const gap = 120;
      const topPipeY = Phaser.Math.Between(100, 400);
  
      // Top pipe
      const topPipe = this.pipes.create(480, topPipeY - gap / 2 - 320, 'pipe');
      topPipe.setOrigin(0, 1);
      topPipe.body.allowGravity = false;
      topPipe.setVelocityX(-200);
      topPipe.passed = false;
  
      // Bottom pipe
      const bottomPipe = this.pipes.create(480, topPipeY + gap / 2, 'pipe');
      bottomPipe.setOrigin(0, 0);
      bottomPipe.body.allowGravity = false;
      bottomPipe.setVelocityX(-200);
      bottomPipe.passed = false;
    }
  
    hitPipe() {
      this.gameOver();
    }
  
    gameOver() {
      this.isGameOver = true;
      this.physics.pause();
      this.scoreText.setText('Game Over! Score: ' + Math.floor(this.score));
      
      this.input.once('pointerdown', () => this.scene.restart(), this);
      this.input.keyboard.once('keydown-SPACE', () => this.scene.restart(), this);
    }
  }
  
  const config = {
    type: Phaser.AUTO,
    width: 480,
    height: 640,
    physics: {
      default: 'arcade',
    },
    scene: FlappyBird,
    parent: 'game-container',
    backgroundColor: '#70c5ce',
  };
  
  const game = new Phaser.Game(config);
  