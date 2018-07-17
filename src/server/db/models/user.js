import bcrypt from 'bcrypt-nodejs';

module.exports = (sequelize, DataTypes) => {
    let User = sequelize.define(
        'user',
        {
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
            email: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: {
                        msg: 'Must be a valid email.'
                    }
                }
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            }
        },
        {
            hooks: {
                beforeCreate: (user, options) => {
                    return encryptPassword(user.password).then((success) => {
                        console.log('Encrypted password');
                        user.password = success;
                    });
                }
            }
        }
    );

    User.prototype.validPassword = function(password) {
        return bcrypt.compareSync(password, this.password);
    };

    function encryptPassword(password) {
        return new Promise(function(resolve, reject) {
            bcrypt.genSalt(10, function(err, salt) {
                if (err) return reject(err);
                bcrypt.hash(password, salt, null, function(err, hash) {
                    if (err) return reject(err);
                    return resolve(hash);
                });
            });
        });
    }

    User.associate = function(models) {
        User.hasMany(models.solvedProblem, {
            foreignKey: 'userId',
            constraints: false
        });
    };

    return User;
};
