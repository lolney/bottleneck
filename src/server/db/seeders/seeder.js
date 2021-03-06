import ImageProblem from '../../../problem-engine/ImageProblem';
import uuidv4 from 'uuid/v4';
import { date } from '../../db';
import BinaryTreeProblem from '../../../problem-engine/BinaryTreeProblem';
import { WIDTH, HEIGHT } from '../../.../../../config';
import RegexProblem from '../../../problem-engine/RegexProblem';
import { randomInRanges, randomInt } from '../../../lib/random';
import regexes from './regexes.json';
import { problemTypes } from '../../../constants';

const NUM_OBJECTS = 50;
const RIVER_RADIUS = 120;
const SIDE_BUFFER = 40;

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
    // Add BinaryTree, Regex Problems
    const regexProblems = regexes.map(
        (obj) => new RegexProblem(new RegExp(obj))
    );
    problems = problems.concat([new BinaryTreeProblem()]).concat(regexProblems);

    const problemById = {};

    problems.forEach((problem) => {
        problem.id = uuidv4();
        problemById[problem.id] = problem;
    });

    await queryInterface.bulkInsert(
        'problems',
        problems.map((problem, i) => {
            return {
                id: problem.id,
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
            .filter((x) => x.getTypeString() == problemTypes.IMAGE)
            .map((problem, i) => {
                return {
                    id: problem.id,
                    type: problem.getSubproblemString(),
                    original: problem.image.getBase64(),
                    createdAt: date(),
                    updatedAt: date()
                };
            }),
        {}
    );
    await queryInterface.bulkInsert(
        'regexes',
        problems
            .filter((x) => x.getTypeString() == problemTypes.REGEX)
            .map((problem, i) => {
                return {
                    id: problem.id,
                    type: 'default',
                    regex: problem.regex.toString().slice(1, -1),
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
            const problemId = rows[randomInt(0, rows.length)].id;
            const objectType = problemById[problemId].getResourceType();

            return {
                id: uuidv4(),
                location: Sequelize.fn('ST_GeomFromText', randomPoint()),
                objectType,
                collected: false,
                behaviorType: 'resource',
                problemId,
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
    await queryInterface.bulkDelete('images', null, {});
    await queryInterface.bulkDelete('regexes', null, {});
}
