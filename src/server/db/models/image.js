/* 
Need to do queries without associations api,
deciding which table to query based on the typeString of the parent?

Need to include the model to lookup in an include query
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
