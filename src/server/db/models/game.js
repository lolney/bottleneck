module.exports = (sequelize, DataTypes) => {
    let Game = sequelize.define('game', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    });
    Game.associate = function(models) {
        Game.hasMany(models.player, { onDelete: 'CASCADE', hooks: true });
    };
    return Game;
};
