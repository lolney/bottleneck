import DynamicObject from 'lance/serialize/DynamicObject';
import TilingActor from '../client/TilingActor';
import BaseTypes from 'lance/serialize/BaseTypes';
import { horizontalWall, verticalWall } from '../config';
import TwoVector from 'lance/serialize/TwoVector';

export default class WallAvatar extends DynamicObject {
    static get netScheme() {
        return Object.assign(
            {
                width: { type: BaseTypes.TYPES.FLOAT32 },
                height: { type: BaseTypes.TYPES.FLOAT32 }
            },
            super.netScheme
        );
    }

    static get name() {
        return 'WallAvatar';
    }

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        if (props) {
            this.width = props.width;
            this.height = props.height;
        }
        this.behaviors = [];
        this.class = WallAvatar;
    }

    get blocks() {
        return true;
    }

    get isTeleportable() {
        return this.teleportable !== undefined;
    }

    handleTeleport(player) {
        return this.teleportable.handleTeleport(player);
    }

    isValidDirection(direction) {
        if (
            direction == 'LEFT' ||
            (direction == 'RIGHT' && this.width > this.height)
        ) {
            return true;
        } else if (
            direction == 'TOP' ||
            (direction == 'BOTTOM' && this.height > this.width)
        ) {
            return true;
        } else {
            return false;
        }
    }

    attachLadder(gameEngine, direction) {
        if (this.isValidDirection(direction)) {
            if (this.teleportable) {
                this.teleportable.addDirection(direction);
            } else {
                this.teleportable = new Teleportable(
                    gameEngine,
                    this,
                    direction
                );
            }

            // TODO: add sprite
        } else {
            console.error(`Tried to add invalid direction: ${direction}`);
        }
    }

    onAddToWorld(gameEngine) {
        if (gameEngine.renderer) {
            let resource =
                this.width > this.height
                    ? horizontalWall.name
                    : verticalWall.name;
            this.actor = new TilingActor(this, gameEngine.renderer, resource);
        }
    }

    onRemoveFromWorld(gameEngine) {
        if (this.teleportable) {
            delete this.teleportable;
        }
        if (gameEngine.renderer) {
            this.actor.destroy(this.id, gameEngine.renderer);
        }
    }
}

export class Teleportable {
    constructor(wall, edge) {
        this.edges = [edge];
        this.wall = wall;
    }

    getTeleportVector(edge, player) {
        if (edge == 'LEFT' || edge == 'RIGHT') {
            const x = 2 * (this.wall.position.x - player.position.x);
            return new TwoVector(x, 0);
        } else {
            const y = 2 * (this.wall.position.y - player.position.y);
            return new TwoVector(0, y);
        }
    }

    handleTeleport(player) {
        const edge = this.getCollidingEdge(player);
        if (edge) {
            this.teleport(player, edge);
            return true;
        }
        return false;
    }

    addDirection(edge) {
        this.edges.push(edge);
    }

    getCollidingEdge(player) {
        for (const edge of this.edges) {
            if (this.checkCollision(player, edge)) {
                return edge;
            }
        }
        return undefined;
    }

    checkCollision(player, edge) {
        switch (edge) {
        case 'LEFT':
            return (
                player.position.x <
                    this.wall.position.x - this.wall.width / 2
            );
        case 'RIGHT':
            return (
                player.position.x >
                    this.wall.position.x + this.wall.width / 2
            );
        case 'TOP':
            return (
                player.position.y <
                    this.wall.position.y - this.wall.height / 2
            );
        case 'BOTTOM':
            return (
                player.position.y >
                    this.wall.position.y + this.wall.height / 2
            );
        default:
            throw new Error('Unexpected edge type: ', edge);
        }
    }

    teleport(player, edge) {
        const teleportVector = this.getTeleportVector(edge, player);
        player.position = player.position.add(teleportVector);
    }
}
