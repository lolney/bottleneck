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

export const formatResourceCost = (obj) => {
    return `${obj.wood} wood, ${obj.stone} stone`;
};

export const getAssetPaths = () => {
    let items = siegeItems.concat([
        playerBase,
        waterDummy,
        verticalWall,
        horizontalWall
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

export const dirt = {
    name: 'dirt',
    image: 'assets/dirt.png'
};

export const waterDummy = {
    id: siegeItemCounter.inc(),
    name: 'Transparent',
    image: 'assets/x.svg',
    type: 'defensive'
};

export const siegeItems = [
    {
        name: 'Gate',
        image: 'assets/gate.png',
        type: 'offensive',
        width: 32,
        height: 21,
        cost: {
            wood: '4',
            stone: '0'
        }
    },
    {
        name: 'Bridge',
        image: 'assets/bridge4.png',
        type: 'offensive',
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
        sync: 'extrapolate',
        localObjBending: 0.0,
        remoteObjBending: 0.0,
        bendingIncrements: 6
    },
    auth: {
        username: 'test',
        password: 'secret'
    },
    collisionOptions: {
        collisions: {
            type: 'HSHG',
            keyObjectDetection: true
        }
    }
};
