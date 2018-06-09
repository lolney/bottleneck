import { WIDTH, HEIGHT } from '../../../common/MyGameEngine';

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
