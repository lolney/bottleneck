import Problem from './problem';

module.exports = (sequelize, DataTypes) => {
    let GameObject = sequelize.define(
        'gameObject',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV1,
                primaryKey: true
            },
            location: DataTypes.GEOMETRY('POINT'),
            objectType: DataTypes.TEXT
        },
        {
            classMethods: {
                associate: function(models) {
                    GameObject.hasOne(models.Problem);
                }
            }
        }
    );
    return GameObject;
};
