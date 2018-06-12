// import { WIDTH, HEIGHT } from '../../../common/MyGameEngine';
import ImageProblem from '../../../problem-engine/ImageProblem';

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

export async function up(queryInterface) {
    const base = [...Array(10).keys()];
    let problems = await Promise.all(
        base.map(async (i) => {
            return await ImageProblem.create(ImageProblem.generate());
        })
    );
    await queryInterface.bulkInsert(
        'problem',
        problems.map((problem) => {
            return {
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
    const courseRows = courses[0];
    return await queryInterface.bulkInsert(
        'gameObject',
        inserted_problems.map((row) => {
            return {
                location: [Math.random() * WIDTH, Math.random() * HEIGHT],
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
