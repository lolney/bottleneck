module.exports = (sequelize, DataTypes) => {
    return sequelize.define('problem', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV1,
            primaryKey: true
        },
        title: DataTypes.TEXT,
        description: DataTypes.TEXT,
        original: DataTypes.TEXT,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    });
};
