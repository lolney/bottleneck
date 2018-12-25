module.exports = (sequelize, DataTypes) => {
    let User = sequelize.define('user', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING(50),
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            unique: true,
            validate: {
                len: {
                    args: [0, 50],
                    msg: 'Too many characters'
                }
            }
        },
        isGuest: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        isIdle: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    });

    User.associate = function(models) {
        User.hasMany(models.solvedProblem, {
            foreignKey: 'userId',
            constraints: false,
            onDelete: 'CASCADE',
            hooks: true
        });
        User.belongsTo(models.game, {
            foreignKey: 'gameId',
            constraints: false
        });
        User.hasOne(models.player, { onDelete: 'CASCADE', hooks: true });
    };

    return User;
};
