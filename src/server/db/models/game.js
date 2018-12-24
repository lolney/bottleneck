module.exports = (sequelize, DataTypes) => {
    let Game = sequelize.define(
        'game',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        },
        {
            hooks: {
                beforeDestroy: async (game) => {
                    const players = await game.getPlayers();
                    for (const player of players) {
                        let user = await player.getUser();
                        if (user.isGuest) {
                            user.destroy();
                        }
                    }
                }
            }
        }
    );
    Game.associate = function(models) {
        Game.hasMany(models.player, { onDelete: 'CASCADE', hooks: true });
    };
    return Game;
};
