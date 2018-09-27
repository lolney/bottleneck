/**
 * The Player represents the state of a User that is tied to a
 * particular game
 */
module.exports = (sequelize, DataTypes) => {
    let Player = sequelize.define('player', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        playerNumber: DataTypes.INTEGER,
        location: DataTypes.GEOMETRY('POINT'),
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    });
    Player.associate = function(models) {
        Player.belongsTo(models.user);
        Player.hasOne(models.resource);
    };
    return Player;
};
