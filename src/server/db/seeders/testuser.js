import { date } from '../../db';
import uuidv4 from 'uuid/v4';

const createUser = (user, password) => ({
    id: uuidv4(),
    username: user,
    createdAt: date(),
    updatedAt: date()
});

export async function up(queryInterface, Sequelize) {
    return await queryInterface.bulkInsert(
        'users',
        [createUser('test'), createUser('_botuser')],
        {
            individualHooks: true
        }
    );
}

export async function down(queryInterface) {
    await queryInterface.bulkDelete('users', {});
}
