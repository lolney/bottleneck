module.exports = (sequelize, DataTypes) => {
    return sequelize.define('problem', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV1,
            primaryKey: true
        },
        title: DataTypes.STRING,
        description: DataTypes.STRING,
        original: DataTypes.STRING
    });
};
