module.exports = (sequelize, DataTypes) => {
    let RegexProblem = sequelize.define('regex', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        type: DataTypes.TEXT,
        regex: DataTypes.TEXT,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    });
    RegexProblem.associate = function(models) {
        RegexProblem.belongsTo(models.problem, {
            foreignKey: 'id',
            targetKey: 'id'
        });
    };
    return RegexProblem;
};
