import CounterableAvatar from './CounterableAvatar';
import TilingActor from '../client/TilingActor';
import BaseTypes from 'lance/serialize/BaseTypes';
import { horizontalWall, verticalWall } from '../config';
import TwoVector from 'lance/serialize/TwoVector';
import { max } from 'moment';

export const Edges = Object.freeze({
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    TOP: 'TOP',
    BOTTOM: 'BOTTOM'
});

export default class WallAvatar extends CounterableAvatar {
    static get netScheme() {
        return Object.assign(
            {
                objectType: { type: BaseTypes.TYPES.STRING },
                width: { type: BaseTypes.TYPES.FLOAT32 },
                height: { type: BaseTypes.TYPES.FLOAT32 },
                attachedSiegeItemId: { type: BaseTypes.TYPES.STRING }
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
            this.objectType = props.objectType ? props.objectType : 'Wall';
        }
        this.attachedSiegeItemId = null;
        this.behaviors = [];
        this.class = WallAvatar;
    }

    get blocks() {
        return true;
    }

    get isTeleportable() {
        return this.teleportable !== undefined;
    }

    get isVertical() {
        return this.width < this.height;
    }

    handleTeleport(player) {
        return this.teleportable.handleTeleport(player);
    }

    getDirections() {
        if (this.isVertical) {
            return [Edges.LEFT, Edges.RIGHT];
        } else {
            return [Edges.TOP, Edges.BOTTOM];
        }
    }

    attachSiegeItemSprite(siegeItemId) {
        const name = this.isVertical ? 'ladderSide' : 'Ladder';

        super.attachSiegeItemSprite(siegeItemId, name);
        this.attachLadder();
    }

    /**
     * Required to get the desired serverside behavior
     * @param {*} siegeItemId
     */
    attachCounter(siegeItemId) {
        super.attachCounter(siegeItemId);
        this.attachLadder();
    }

    attachLadder() {
        const directions = this.getDirections();
        this.teleportable = new Teleportable(this, directions);
    }

    onAddToWorld(gameEngine) {
        if (gameEngine.renderer) {
            let resource =
                this.width > this.height
                    ? horizontalWall.name
                    : verticalWall.name;
            this.actor = new TilingActor(this, gameEngine.renderer, resource);
        }
        if (this.attachedSiegeItemId) {
            this.attachSiegeItemSprite(this.attachedSiegeItemId);
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
        this.edges = edge instanceof Array ? edge : [edge];
        this.wall = wall;
    }

    getTeleportVector(edge, player) {
        if (edge == Edges.LEFT || edge == Edges.RIGHT) {
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

    inRange(player, isVertical) {
        const prop = isVertical ? 'y' : 'x';
        const margin = 1 / 4;

        const x = this.wall.position[prop];
        const myX = player.position[prop];
        const length = isVertical ? this.wall.height / 2 : this.wall.width / 2;

        const min = x - length * margin;
        const max = x + length * margin;

        return myX > min && myX < max;
    }

    checkCollision(player, edge) {
        switch (edge) {
        case Edges.LEFT:
            return (
                this.inRange(player, true) &&
                    player.position.x <
                        this.wall.position.x - this.wall.width / 2
            );
        case Edges.RIGHT:
            return (
                this.inRange(player, true) &&
                    player.position.x >
                        this.wall.position.x + this.wall.width / 2
            );
        case Edges.TOP:
            return (
                this.inRange(player, false) &&
                    player.position.y <
                        this.wall.position.y - this.wall.height / 2
            );
        case Edges.BOTTOM:
            return (
                this.inRange(player, false) &&
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
