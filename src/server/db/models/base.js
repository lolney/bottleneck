module.exports = (sequelize, DataTypes) => {
    let Base = sequelize.define('base', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        hp: DataTypes.INTEGER,
        location: DataTypes.GEOMETRY('POINT'),
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    });
    Base.associate = function(models) {
        Base.belongsTo(models.player);
    };
    return Base;
};
