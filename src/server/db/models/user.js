import bcrypt from 'bcrypt-nodejs';

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
            defaultValue: true,
            allowNull: false
        },
        playerId: {
            type: DataTypes.STRING
        }
    });

    User.associate = function(models) {
        User.hasMany(
            models.solvedProblem,
            {
                foreignKey: 'userId',
                constraints: false
            },
            { onDelete: 'CASCADE', hooks: true }
        );
        User.hasOne(models.player, { onDelete: 'CASCADE', hooks: true });
    };

    return User;
};
