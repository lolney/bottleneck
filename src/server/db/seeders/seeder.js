// import { WIDTH, HEIGHT } from '../../../common/MyGameEngine';
import ImageProblem from '../../../problem-engine/ImageProblem';
import uuidv1 from 'uuid/v1';

const WIDTH = 1000;
const HEIGHT = 600;

export function objects(queryInterface, Sequelize) {
    return queryInterface.bulkInsert(
        'GameObject',
        [...Array(10).keys()].map(() => {
            return {
                location: [Math.random() * WIDTH, Math.random() * HEIGHT],
                objectType: 'tree'
            };
        }),
        {}
    );
}

function createPoint() {
    let x = Math.random() * WIDTH;
    let y = Math.random() * HEIGHT;
    return 'POINT(' + x + ' ' + y + ')';
}

export async function up(queryInterface, Sequelize) {
    const base = [...Array(10).keys()];
    let problems = await Promise.all(
        base.map(async (i) => {
            return await ImageProblem.create(ImageProblem.generate());
        })
    );
    await queryInterface.bulkInsert(
        'problems',
        problems.map((problem) => {
            return {
                id: uuidv1(),
                title: problem.getTitle(),
                description: problem.getDescription(),
                original: problem.getBase64()
            };
        }),
        {}
    );
    const inserted_problems = await queryInterface.sequelize.query(
        `SELECT id from PROBLEMS;`
    );
    return await queryInterface.bulkInsert(
        'gameObjects',
        inserted_problems.map((row) => {
            return {
                id: uuidv1(),
                location: Sequelize.fn('ST_GeomFromText', createPoint()),
                objectType: 'tree',
                problemId: row.id
            };
        }),
        {}
    );
}

export async function down(queryInterface) {
    await queryInterface.bulkDelete('gameObjects', null, {});
    await queryInterface.bulkDelete('problems', null, {});
}
