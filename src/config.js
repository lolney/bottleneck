export const WIDTH = 2000;
export const HEIGHT = 1200;

export const getSiegeItemFromId = (id) => {
    return siegeItems.find((item) => item.id == id);
};

export const getSiegeItemsAssetPaths = () => {
    let assetPaths = {};
    for (const item of siegeItems) {
        assetPaths[item.name] = item.image;
    }
    return assetPaths;
};

export const Player = {
    height: 25,
    width: 25
};

export const siegeItems = [
    {
        name: 'Gate',
        image: 'assets/sprites/tree1.png',
        type: 'offensive',
        cost: {
            wood: '4',
            stone: '0'
        }
    },
    {
        name: 'Bridge',
        image: 'assets/sprites/tree1.png',
        type: 'offensive',
        cost: {
            wood: '4',
            stone: '0'
        }
    },
    {
        name: 'Ladder',
        image: 'assets/sprites/Rock1.png',
        type: 'offensive',
        cost: {
            wood: '4',
            stone: '0'
        }
    },
    {
        name: 'Slowfield',
        image: 'assets/slowfield.png',
        type: 'defensive',
        cost: {
            wood: '2',
            stone: '2'
        }
    },
    {
        name: 'Pit',
        image: 'assets/hole.png',
        type: 'defensive',
        cost: {
            wood: '1',
            stone: '3'
        }
    },
    {
        name: 'Fence',
        image: 'assets/sprites/tree2.png',
        type: 'defensive',
        cost: {
            wood: '4',
            stone: '0'
        }
    }
].map((obj, i) => Object.assign({ id: i.toString() }, obj));
