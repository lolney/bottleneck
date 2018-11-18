import AnimatedActor from './AnimatedActor';
import { Status } from '../common/BotAvatar';

let PIXI = null;

/**
 * Handles renderer-specific details for player
 */
export default class PlayerActor extends AnimatedActor {
    constructor(avatar, renderer, identity, mainPlayer) {
        super(avatar, renderer, identity, 0.25);
        PIXI = require('pixi.js');

        this.lastPosition = Object.assign({}, avatar.position);

        this.animate = false;
        this.mainPlayer = mainPlayer;

        this.applyFilters(identity, renderer, avatar);
        // Store in the renderer and in PIXI's renderer
        if (!mainPlayer) {
            this.sprite.x = avatar.position.x;
            this.sprite.y = avatar.position.y;
            renderer.camera.addChild(this.sprite);
        } else {
            this.sprite.x = renderer.viewportWidth / 2;
            this.sprite.y = renderer.viewportHeight / 2;
            renderer.layer1.addChild(this.sprite);
        }
    }

    applyFilters(identity, renderer, avatar) {
        switch (identity) {
        case 'assaultBot':
        case 'collectorBot':
        case 'bot':
            if (renderer.gameEngine.isOwnedByPlayer(avatar)) {
                this.sprite.tint = '0x467998'; // blue
            } else {
                this.sprite.tint = '0xf33b3b'; // red
            }
            break;
        default:
            break;
        }
    }

    handleStatusChange(status) {
        if (status == Status.IDLE) {
            if (!this.stuckIndicator) {
                this.stuckIndicator = new PIXI.Sprite(
                    PIXI.loader.resources['questionMark'].texture
                );
                this.stuckIndicator.anchor.set(0.5, 0.5);
                this.stuckIndicator.y = -this.sprite.height / 2;
                this.sprite.addChild(this.stuckIndicator);
            }
        } else if (this.stuckIndicator) {
            this.sprite.removeChild(this.stuckIndicator);
            this.stuckIndicator = null;
        }
    }

    handleDraw(position) {
        if (this.animate) {
            if (!this.moved(position)) {
                this.animate = false;
                this.sprite.gotoAndStop(0);
            }
        } else {
            if (this.moved(position)) {
                this.sprite.play();
                this.animate = true;
            }
        }
        this.lastPosition = Object.assign({}, position);
    }

    moved(position) {
        return (
            this.lastPosition.x != position.x ||
            this.lastPosition.y != position.y
        );
    }
}
