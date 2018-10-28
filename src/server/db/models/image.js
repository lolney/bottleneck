/**
 * Subtype of problem
 */
module.exports = (sequelize, DataTypes) => {
    let ImageProblem = sequelize.define('image', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        original: DataTypes.TEXT,
        type: DataTypes.TEXT, // either sin or null
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    });
    ImageProblem.associate = function(models) {
        ImageProblem.belongsTo(models.problem, {
            foreignKey: 'id',
            targetKey: 'id'
        });
    };
    return ImageProblem;
};
