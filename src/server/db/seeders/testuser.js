import { date } from '../views';
import uuidv4 from 'uuid/v4';
import bcrypt from 'bcrypt-nodejs';

export async function up(queryInterface, Sequelize) {
    return await queryInterface.bulkInsert(
        'users',
        [
            {
                id: uuidv4(),
                username: 'test',
                password: bcrypt.hashSync(
                    'secret',
                    bcrypt.genSaltSync(10),
                    null
                ),
                email: 'test@example.com',
                createdAt: date(),
                updatedAt: date()
            }
        ],
        { individualHooks: true }
    );
}

export async function down(queryInterface) {
    await queryInterface.bulkDelete('users', {});
}
