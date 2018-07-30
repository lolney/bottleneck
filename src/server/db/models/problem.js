module.exports = (sequelize, DataTypes) => {
    let Problem = sequelize.define('problem', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: DataTypes.TEXT,
        description: DataTypes.TEXT,
        name: DataTypes.TEXT,
        type: DataTypes.TEXT,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    });
    Problem.associate = function(models) {
        Problem.hasMany(models.solvedProblem);
    };
    return Problem;
};
