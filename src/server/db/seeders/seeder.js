// import { WIDTH, HEIGHT } from '../../../common/MyGameEngine';
import ImageProblem from '../../../problem-engine/ImageProblem';
import uuidv1 from 'uuid/v1';
import moment from 'moment';

const WIDTH = 1000;
const HEIGHT = 600;

function createPoint() {
    let x = Math.random() * WIDTH;
    let y = Math.random() * HEIGHT;
    return 'POINT(' + x + ' ' + y + ')';
}

function date() {
    return moment().format('YYYY-MM-DD HH:mm:ss');
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
                original: problem.getBase64(),
                createdAt: date(),
                updatedAt: date()
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
