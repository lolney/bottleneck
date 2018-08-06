module.exports = (sequelize, DataTypes) => {
    let SolvedProblem = sequelize.define('solvedProblem', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        code: DataTypes.TEXT,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    });
    SolvedProblem.associate = function(models) {
        SolvedProblem.belongsTo(models.user, {
            foreignKey: 'userId',
            constraints: false
        });
        SolvedProblem.belongsTo(models.problem, {
            foreignKey: 'problemId',
            constraints: false
        });
    };
    return SolvedProblem;
};
