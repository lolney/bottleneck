import sequelize from './index';

export default Problem = sequelize.define('user', {
    id: Sequelize.STRING,
    title: Sequelize.STRING,
    description: Sequelize.STRING,
    original: Sequelize.String,
});
