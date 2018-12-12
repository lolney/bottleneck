import ImageProblem from '../../../problem-engine/ImageProblem';
import uuidv4 from 'uuid/v4';
import { date } from '../../db';
import BinaryTreeProblem from '../../../problem-engine/BinaryTreeProblem';
import { WIDTH, HEIGHT } from '../../.../../../config';

let randomInt = (minimum, maximum) =>
    Math.floor(Math.random() * (maximum - minimum)) + minimum;

const NUM_OBJECTS = 50;
const RIVER_RADIUS = 120;
const SIDE_BUFFER = 40;

function randomInRanges(...ranges) {
    let rangeIndex = randomInt(0, ranges.length);
    let range = ranges[rangeIndex];
    if (range.length != 2) {
        throw new TypeError(`Expected array of length 2; got ${range}`);
    }
    return randomInt(range[0], range[1]);
}

function randomPoint() {
    // Can't import GameWorld here since it imports TwoVector
    //let bounds = GameWorld.getResourceBounds();
    let x = randomInRanges(
        [SIDE_BUFFER, WIDTH / 2 - RIVER_RADIUS],
        [WIDTH / 2 + RIVER_RADIUS, WIDTH - SIDE_BUFFER]
    );
    let y = randomInRanges(
        [SIDE_BUFFER, 0.25 * HEIGHT],
        [HEIGHT - 0.25 * HEIGHT, HEIGHT - SIDE_BUFFER]
    );
    return 'POINT(' + x + ' ' + y + ')';
}

export async function up(queryInterface, Sequelize) {
    const base = [...Array(10).keys()];
    let problems = await Promise.all(
        base.map(async (i) => {
            return await ImageProblem.createProblemFromGenerator(i);
        })
    );
    // Add BinaryTree Problems
    problems = problems.concat([new BinaryTreeProblem()]);
    let ids = problems.map(() => uuidv4());

    await queryInterface.bulkInsert(
        'problems',
        problems.map((problem, i) => {
            return {
                id: ids[i],
                title: problem.getTitle(),
                description: problem.getDescription(),
                name: problem.getName(),
                type: problem.getTypeString(),
                createdAt: date(),
                updatedAt: date()
            };
        }),
        {}
    );
    await queryInterface.bulkInsert(
        'images',
        problems
            .filter((x) => x.getTypeString() == 'image')
            .map((problem, i) => {
                return {
                    id: ids[i],
                    type: problem.getSubproblemString(),
                    original: problem.image.getBase64(),
                    createdAt: date(),
                    updatedAt: date()
                };
            }),
        {}
    );

    const inserted_problems = await queryInterface.sequelize.query(
        'SELECT id FROM "problems";'
    );
    const rows = inserted_problems[0];
    await queryInterface.bulkInsert(
        'gameObjects',
        [...Array(NUM_OBJECTS).keys()].map((i) => {
            return {
                id: uuidv4(),
                location: Sequelize.fn('ST_GeomFromText', randomPoint()),
                objectType: 'tree',
                collected: false,
                behaviorType: 'resource',
                problemId: rows[randomInt(0, rows.length)].id,
                createdAt: date(),
                updatedAt: date()
            };
        }),
        {}
    );

    const inserted_gameObjects = await queryInterface.sequelize.query(
        'SELECT id FROM "gameObjects";'
    );
    const gameObject_rows = inserted_gameObjects[0];

    const createResource = (resource) => {
        return (i) => {
            return {
                id: uuidv4(),
                count: 10,
                name: resource,
                parent: 'gameObject',
                gameObjectId: gameObject_rows[i].id,
                createdAt: date(),
                updatedAt: date()
            };
        };
    };

    await queryInterface.bulkInsert(
        'resources',
        [
            ...[...Array(NUM_OBJECTS).keys()].map(createResource('stone')),
            ...[...Array(NUM_OBJECTS).keys()].map(createResource('wood'))
        ],
        {}
    );
}

export async function down(queryInterface) {
    await queryInterface.bulkDelete('gameObjects', null, {});
    await queryInterface.bulkDelete('problems', null, {});
}
