module.exports = (sequelize, DataTypes) => {
    let Resource = sequelize.define('resource', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        parent: DataTypes.TEXT,
        name: DataTypes.TEXT,
        count: DataTypes.INTEGER,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    });
    Resource.prototype.getItem = function(options) {
        return this[
            'get' +
                this.get('parent')
                    .substr(0, 1)
                    .toUpperCase() +
                this.get('parent').substr(1)
        ](options);
    };

    Resource.associate = function(models) {
        Resource.belongsTo(models.gameObject, {
            constraints: false
        });
        Resource.belongsTo(models.player, {
            constraints: false
        });
    };
    return Resource;
};
