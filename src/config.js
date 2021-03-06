import { resourceObjectTypes, resourceTypes } from './constants';

export const WIDTH = 2000;
export const HEIGHT = 1200;

class SiegeItemCounter {
    constructor() {
        this.count = 0;
    }

    inc() {
        return (this.count++).toString();
    }
}
let siegeItemCounter = new SiegeItemCounter();

export const getSiegeItemFromId = (id) => {
    return siegeItems.find((item) => item.id == id);
};

export const getSiegeItemFromName = (name) => {
    return siegeItems.find((item) => item.name == name);
};

export const formatResourceCost = (obj) => {
    return `${obj.wood} wood, ${obj.stone} stone`;
};

export const getAssetPaths = () => {
    let items = siegeItems.concat([
        playerBase,
        waterDummy,
        verticalWall,
        horizontalWall,
        tutorialArrow
    ]);
    let assetPaths = {};
    for (const item of items) {
        assetPaths[item.name] = item.image;
    }
    return assetPaths;
};

export const Player = {
    height: 25,
    width: 25
};

export const assaultBot = {
    height: 25,
    width: 25,
    cost: {
        wood: '10',
        stone: '10'
    },
    damage: 10
};

export const playerBase = {
    baseHP: 50,
    height: 50,
    width: 50,
    name: 'Keep',
    image: 'assets/Keep-warped.png'
};

export const verticalWall = {
    name: 'verticalWall',
    image: 'assets/rock-wall-vertical.png'
};

export const horizontalWall = {
    name: 'horizontalWall',
    image: 'assets/rock-wall-horizontal.png'
};

export const tutorialArrow = {
    name: 'tutorialArrow',
    image: 'assets/arrow.png'
};

export const dirt = {
    name: 'dirt',
    image: 'assets/dirt.png'
};

export const waterDummy = {
    id: siegeItemCounter.inc(),
    name: 'Water',
    image: 'assets/x-copy.svg',
    type: 'defensive'
};

export const siegeItems = [
    {
        name: 'Bridge',
        image: 'assets/bridge4.png',
        type: 'offensive',
        counters: ['Water', 'Slowfield', 'Pit'],
        width: 60,
        height: 24,
        cost: {
            wood: '4',
            stone: '0'
        }
    },
    {
        name: 'Ladder',
        image: 'assets/ladder1.png',
        type: 'offensive',
        counters: ['Wall', 'Fence'],
        width: 12,
        height: 32,
        cost: {
            wood: '4',
            stone: '0'
        }
    },
    {
        name: 'Slowfield',
        image: 'assets/slowfield3.png',
        type: 'defensive',
        width: 60,
        height: 20,
        behavior: 'slows',
        cost: {
            wood: '2',
            stone: '2'
        }
    },
    {
        name: 'Pit',
        image: 'assets/hole2.png',
        type: 'defensive',
        width: 64,
        height: 34,
        behavior: 'blocks',
        cost: {
            wood: '1',
            stone: '3'
        }
    },
    {
        name: 'Fence',
        image: 'assets/fence.png',
        type: 'defensive',
        width: 32,
        height: 19,
        behavior: 'blocks',
        cost: {
            wood: '4',
            stone: '0'
        }
    }
].map((obj) => Object.assign({ id: siegeItemCounter.inc() }, obj));

export const resourceIcons = [
    { name: 'wood', height: '20px', width: '20px', src: 'assets/log.png' },
    {
        name: 'stone',
        height: '20px',
        width: '20px',
        src: 'assets/rock-particle.png'
    }
];

export const clientDefaults = {
    traceLevel: 1,
    delayInputCount: 3,
    scheduler: 'render-schedule',
    syncOptions: {
        // Extrapolate: can go beyond server data, then corrected
        // Interpolate: must wait for server data
        sync: 'extrapolate',
        // Bending: 0-1. Controls object angle, position, velocity.
        // Amount of the total to bend in a single step
        localObjBending: 0.0, // local objects: those belonging to current player
        remoteObjBending: 0.0,
        // Number of steps to apply the bending
        bendingIncrements: 6
    },
    collisionOptions: {
        collisions: {
            type: 'HSHG',
            keyObjectDetection: true
        }
    }
};

export const resources = [
    {
        objectType: resourceObjectTypes.ROCK,
        behaviorType: 'resource',
        yield: 5,
        resource: resourceTypes.STONE
    },
    {
        objectType: resourceObjectTypes.TREE,
        behaviorType: 'resource',
        yield: 5,
        resource: resourceTypes.WOOD
    },
    {
        objectType: resourceObjectTypes.MINE,
        behaviorType: 'resource',
        yield: 10,
        resource: resourceTypes.STONE
    }
];
