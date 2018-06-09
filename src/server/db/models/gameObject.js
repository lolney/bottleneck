import sequelize from './index';
import Problem from './problem';

export default (GameObject = sequelize.define('user', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
    },
    location: DataTypes.GEOMETRY,
    objectType: DataTypes.STRING
}));

GameObject.hasOne(Problem);
