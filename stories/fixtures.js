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
        costwood: '4',
        coststone: '0'
    },
    {
        name: 'Bridge',
        image: 'assets/sprites/tree1.png',
        type: 'offensive',
        costwood: '4',
        coststone: '0'
    },
    {
        name: 'Ladder',
        image: 'assets/sprites/Rock1.png',
        type: 'offensive',
        costwood: '4',
        coststone: '0'
    },
    {
        name: 'Slowfield',
        image: 'assets/sprites/Rock2.png',
        type: 'defensive',
        costwood: '2',
        coststone: '2'
    },
    {
        name: 'Pit',
        image: 'assets/sprites/tree2.png',
        type: 'defensive',
        costwood: '1',
        coststone: '3'
    },
    {
        name: 'Fence',
        image: 'assets/sprites/tree2.png',
        type: 'defensive',
        costwood: '4',
        coststone: '0'
    }
];