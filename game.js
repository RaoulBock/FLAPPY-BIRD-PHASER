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
    this.add.image(this.scale.width / 2, this.scale.height / 2, 'background')
        .setDisplaySize(this.scale.width, this.scale.height);

    this.bird = this.physics.add.sprite(this.scale.width * 0.25, this.scale.height / 2, 'bird').setScale(0.5);
    this.bird.setGravityY(600);

    this.input.keyboard.on('keydown-SPACE', this.flap, this);
    this.input.on('pointerdown', this.flap, this);

    this.pipes = this.physics.add.group();

    this.pipeTimer = this.time.addEvent({
      delay: 1500,
      callback: this.addPipeRow,
      callbackScope: this,
      loop: true,
    });

    this.score = 0;
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 4,
    });

    this.physics.add.collider(this.bird, this.pipes, this.hitPipe, null, this);

    this.isGameOver = false;
  }

  update() {
    if (this.isGameOver) {
      this.bird.setVelocityY(0);
      return;
    }

    if (this.bird.y > this.scale.height || this.bird.y < 0) {
      this.gameOver();
    }

    if (this.bird.body.velocity.y < 0) {
      this.bird.setAngle(-15);
    } else if (this.bird.body.velocity.y >= 0) {
      this.bird.setAngle(15);
    }

    this.pipes.getChildren().forEach(pipe => {
      if (!pipe.passed && pipe.x + pipe.width < this.bird.x) {
        pipe.passed = true;
        this.score += 0.5; // each pipe pair = 1 point
        this.scoreText.setText('Score: ' + Math.floor(this.score));
      }

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
    const gap = 90;
    const pipeWidth = 52;
    const pipeLength = this.scale.height;

    const gapY = Phaser.Math.Between(100, this.scale.height - 100 - gap);

    const topPipe = this.pipes.create(this.scale.width, gapY, 'pipe');
    topPipe.setOrigin(0, 1);
    topPipe.setFlipY(true);
    topPipe.setDisplaySize(pipeWidth, pipeLength);
    topPipe.body.allowGravity = false;
    topPipe.setVelocityX(-200);
    topPipe.passed = false;

    const bottomPipe = this.pipes.create(this.scale.width, gapY + gap, 'pipe');
    bottomPipe.setOrigin(0, 0);
    bottomPipe.setDisplaySize(pipeWidth, pipeLength);
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
    this.bird.setAngle(90);
    this.scoreText.setText('Game Over! Score: ' + Math.floor(this.score));

    this.input.once('pointerdown', () => this.scene.restart(), this);
    this.input.keyboard.once('keydown-SPACE', () => this.scene.restart(), this);
  }
}

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: 'arcade',
  },
  scene: FlappyBird,
  parent: 'game-container',
  backgroundColor: '#70c5ce',
};

const game = new Phaser.Game(config);
