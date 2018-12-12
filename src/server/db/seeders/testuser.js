import { date } from '../../db';
import uuidv4 from 'uuid/v4';
import bcrypt from 'bcrypt-nodejs';

const createUser = (user, password) => ({
    id: uuidv4(),
    username: user,
    password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null),
    email: `${user}@example.com`,
    createdAt: date(),
    updatedAt: date()
});

export async function up(queryInterface, Sequelize) {
    return await queryInterface.bulkInsert(
        'users',
        [createUser('test', 'secret'), createUser('_botuser', 'secret')],
        {
            individualHooks: true
        }
    );
}

export async function down(queryInterface) {
    await queryInterface.bulkDelete('users', {});
}
