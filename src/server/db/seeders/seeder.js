// import { WIDTH, HEIGHT } from '../../../common/MyGameEngine';
import ImageProblem from '../../../problem-engine/ImageProblem';
import uuidv4 from 'uuid/v4';
import { date } from '../views';
import BinaryTreeProblem from '../../../problem-engine/BinaryTreeProblem';

const WIDTH = 2000;
const HEIGHT = 1200;

function createPoint() {
    let x = Math.random() * WIDTH;
    let y = Math.random() * HEIGHT;
    return 'POINT(' + x + ' ' + y + ')';
}

export async function up(queryInterface, Sequelize) {
    const base = [...Array(10).keys()];
    let problems = await Promise.all(
        base.map(async (i) => {
            return await ImageProblem.createProblemId(i);
        })
    );
    // Add BinaryTree Problems
    problems = problems.concat(base.map(() => new BinaryTreeProblem()));

    await queryInterface.bulkInsert(
        'problems',
        problems.map((problem, i) => {
            return {
                id: uuidv4(),
                title: problem.getTitle(),
                description: problem.getDescription(),
                original: problem.image ? problem.image.getBase64() : '',
                type: problem.getTypeString(),
                createdAt: date(),
                updatedAt: date(),
                gameObjectId: uuidv4()
            };
        }),
        {}
    );
    const inserted_problems = await queryInterface.sequelize.query(
        'SELECT id, "gameObjectId" FROM "problems";'
    );
    return await queryInterface.bulkInsert(
        'gameObjects',
        inserted_problems[0].map((row, i) => {
            return {
                id: row.gameObjectId,
                location: Sequelize.fn('ST_GeomFromText', createPoint()),
                objectType: 'tree',
                problemId: row.id,
                createdAt: date(),
                updatedAt: date()
            };
        }),
        {}
    );
}

export async function down(queryInterface) {
    await queryInterface.bulkDelete('gameObjects', null, {});
    await queryInterface.bulkDelete('problems', null, {});
}
