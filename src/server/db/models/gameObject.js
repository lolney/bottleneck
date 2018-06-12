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
            objectType: DataTypes.TEXT,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
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
