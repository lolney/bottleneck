module.exports = (sequelize, DataTypes) => {
    let GameObject = sequelize.define('gameObject', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        location: DataTypes.GEOMETRY('POINT'),
        behaviorType: DataTypes.ENUM('resource', 'defence'),
        objectType: DataTypes.TEXT,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    });
    GameObject.associate = function(models) {
        GameObject.belongsTo(models.problem);
    };
    return GameObject;
};
