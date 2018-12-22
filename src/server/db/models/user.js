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
            allowNull: false,
            unique: true,
            validate: {
                len: {
                    args: [0, 50],
                    msg: 'Too many characters'
                }
            }
        },
        playerId: {
            type: DataTypes.STRING
        }
    });

    User.associate = function(models) {
        User.hasMany(models.solvedProblem, {
            foreignKey: 'userId',
            constraints: false
        });
        User.hasOne(models.player);
    };

    return User;
};
