import GameConsts from "lib/GameConsts";
import { isJumpJetInputActive } from "./InputHelpers";
import updatePlayerAngles from "./updatePlayerAngles";

function isFacingLeft(angle) {
  return (angle < 0 && angle > -90) || (angle < 270 && angle > 180);
}

function isFacingRight(angle) {
  return !isFacingLeft(angle);
}

function isRunningLeftAndFacingLeft(
  isMovingLeft,
  isMovingRight,
  mouseX,
  playerX
) {
  return isMovingLeft && !isMovingRight && mouseX < playerX;
}

function isRunningLeftAndFacingRight(
  isMovingLeft,
  isMovingRight,
  mouseX,
  playerX
) {
  return isMovingLeft && !isMovingRight && mouseX > playerX;
}

function isRunningRightAndFacingLeft(
  isMovingLeft,
  isMovingRight,
  mouseX,
  playerX
) {
  return !isMovingLeft && isMovingRight && mouseX < playerX;
}

function isRunningRightAndFacingRight(
  isMovingLeft,
  isMovingRight,
  mouseX,
  playerX
) {
  return !isMovingLeft && isMovingRight && mouseX > playerX;
}

function isNotMoving(isMovingLeft, isMovingRight) {
  return !isMovingLeft && !isMovingRight;
}

export default function PlayerMovementHandler() {
  const state = this.game.store.getState();
  const isMovingLeft = this.game.input.keyboard.isDown(
    state.game.keyboardControls.left
  );
  const isMovingRight = this.game.input.keyboard.isDown(
    state.game.keyboardControls.right
  );

  if (state.player.health <= 0) return;

  const angle =
    (this.game.physics.arcade.angleToPointer(window.RS.player) * 180) /
      Math.PI +
    90;
  updatePlayerAngles.call(this, window.RS.player, angle);

  if (
    isRunningLeftAndFacingLeft(
      isMovingLeft,
      isMovingRight,
      this.game.input.worldX,
      window.RS.player.x
    )
  ) {
    window.RS.player.playerSprite.animations.play("runLeft-faceLeft");
  } else if (
    isRunningLeftAndFacingRight(
      isMovingLeft,
      isMovingRight,
      this.game.input.worldX,
      window.RS.player.x
    )
  ) {
    window.RS.player.playerSprite.animations.play("runLeft-faceRight");
  } else if (
    isRunningRightAndFacingLeft(
      isMovingLeft,
      isMovingRight,
      this.game.input.worldX,
      window.RS.player.x
    )
  ) {
    window.RS.player.playerSprite.animations.play("runRight-faceLeft");
  } else if (
    isRunningRightAndFacingRight(
      isMovingLeft,
      isMovingRight,
      this.game.input.worldX,
      window.RS.player.x
    )
  ) {
    window.RS.player.playerSprite.animations.play("runRight-faceRight");
  }

  if (
    (isNotMoving(isMovingLeft, isMovingRight) ||
      this.game.input.activePointer.rightButton.isDown ||
      isJumpJetInputActive.call(this)) &&
    isFacingLeft(angle)
  ) {
    window.RS.player.playerSprite.frame = GameConsts.STANDING_LEFT_FRAME;
  }

  if (
    (isNotMoving(isMovingLeft, isMovingRight) ||
      this.game.input.activePointer.rightButton.isDown ||
      isJumpJetInputActive.call(this)) &&
    isFacingRight(angle)
  ) {
    window.RS.player.playerSprite.frame = GameConsts.STANDING_RIGHT_FRAME;
  }

  // If the LEFT key is down, set the player velocity to move left
  if (isMovingLeft) {
    window.RS.player.body.acceleration.x = -GameConsts.PLAYER_PHYSICS
      .ACCELERATION;
  }

  // If the RIGHT key is down, set the player velocity to move right
  if (isMovingRight) {
    window.RS.player.body.acceleration.x =
      GameConsts.PLAYER_PHYSICS.ACCELERATION;
  }

  // Stand still
  if (isNotMoving(isMovingLeft, isMovingRight)) {
    window.RS.player.body.acceleration.x = 0;
    window.RS.player.playerSprite.animations.stop();
  }
}
