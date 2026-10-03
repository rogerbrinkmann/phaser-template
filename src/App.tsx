import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import './App.css'

const WORLD_WIDTH = 3200
const WORLD_HEIGHT = 2000
type MovementKeys = Record<
  'up' | 'down' | 'left' | 'right',
  Phaser.Input.Keyboard.Key
>

class PlaygroundScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle
  private wasd!: MovementKeys

  constructor() {
    super('playground')
  }

  create() {
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

    const grid = this.add.graphics()
    grid.lineStyle(1, 0x285056, 0.5)

    for (let x = 0; x <= WORLD_WIDTH; x += 96) {
      grid.lineBetween(x, 0, x, WORLD_HEIGHT)
    }

    for (let y = 0; y <= WORLD_HEIGHT; y += 96) {
      grid.lineBetween(0, y, WORLD_WIDTH, y)
    }

    grid.lineStyle(2, 0x4b8582, 0.75)
    grid.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

    this.add
      .circle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 140, 0x11343a, 0.9)
      .setStrokeStyle(2, 0x55d7bf, 0.65)

    this.add
      .circle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 8, 0xf4c95d)
      .setDepth(1)

    this.player = this.add
      .rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 46, 46, 0xf4c95d)
      .setStrokeStyle(3, 0xfff4c2, 1)
      .setDepth(2)

    this.physics.add.existing(this.player)
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    playerBody.setCollideWorldBounds(true)

    this.wasd = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as MovementKeys

    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08)
    this.setCameraDeadzone()
    this.scale.on(Phaser.Scale.Events.RESIZE, this.setCameraDeadzone, this)
  }

  private setCameraDeadzone() {
    this.cameras.main.setDeadzone(
      Math.min(this.scale.width * 0.55, 420),
      Math.min(this.scale.height * 0.55, 280),
    )
  }

  update() {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    const speed = 240

    playerBody.setVelocity(0)

    if (this.wasd.left.isDown) {
      playerBody.setVelocityX(-speed)
    } else if (this.wasd.right.isDown) {
      playerBody.setVelocityX(speed)
    }

    if (this.wasd.up.isDown) {
      playerBody.setVelocityY(-speed)
    } else if (this.wasd.down.isDown) {
      playerBody.setVelocityY(speed)
    }

    if (playerBody.velocity.length() > speed) {
      playerBody.velocity.normalize().scale(speed)
    }
  }
}

function App() {
  const gameHostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gameHostRef.current) {
      return
    }

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: gameHostRef.current,
      backgroundColor: '#08191d',
      width: '100%',
      height: '100%',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
        },
      },
      scene: PlaygroundScene,
    })

    return () => {
      game.destroy(true)
    }
  }, [])

  return (
    <main className="app-shell">
      <section className="game-panel">
        <div ref={gameHostRef} className="game-host" />
      </section>
      <aside className="dashboard">dashboard</aside>
    </main>
  )
}

export default App
