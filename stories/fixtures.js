export const solvedProblems = [
    { problem: { name: 'image0', type: 'image' }, code: 'code' },
    { problem: { name: 'image1', type: 'image' }, code: 'code' },
    { problem: { name: 'This is a long name', type: 'btree' }, code: 'code' },
    {
        problem: {
            name: 'image2',
            type: 'image',
            subproblem: { type: 'gradient' }
        },
        code: 'code'
    },
    {
        problem: { name: 'image3', type: 'image', subproblem: { type: 'sin' } },
        code: 'code'
    }
];

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
