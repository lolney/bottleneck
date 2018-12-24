'use strict';

let Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "gameObjects", deps: []
 * createTable "problems", deps: []
 *
 **/

let info = {
    revision: 1,
    name: 'gameObject',
    created: '2018-06-12T06:05:23.156Z',
    comment: ''
};

let migrationCommands = [
    {
        fn: 'createTable',
        params: [
            'problems',
            {
                id: {
                    type: Sequelize.UUID,
                    primaryKey: true,
                    defaultValue: Sequelize.UUIDV4
                },
                title: {
                    type: Sequelize.TEXT
                },
                description: {
                    type: Sequelize.TEXT
                },
                name: {
                    type: Sequelize.TEXT
                },
                type: {
                    type: Sequelize.TEXT
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW
                }
            },
            {}
        ]
    },
    {
        fn: 'createTable',
        params: [
            'games',
            {
                id: {
                    type: Sequelize.UUID,
                    primaryKey: true,
                    defaultValue: Sequelize.UUIDV4
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW
                }
            },
            {}
        ]
    },
    {
        fn: 'createTable',
        params: [
            'gameObjects',
            {
                id: {
                    type: Sequelize.UUID,
                    primaryKey: true,
                    defaultValue: Sequelize.UUIDV4
                },
                location: {
                    type: Sequelize.GEOMETRY('POINT')
                },
                objectType: {
                    type: Sequelize.TEXT
                },
                behaviorType: { type: Sequelize.ENUM('resource', 'defense') },
                collected: {
                    type: Sequelize.BOOLEAN
                },
                problemId: {
                    type: Sequelize.UUID,
                    references: {
                        model: 'problems',
                        key: 'id'
                    }
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW
                }
            },
            {}
        ]
    },
    {
        fn: 'createTable',
        params: [
            'users',
            {
                id: {
                    type: Sequelize.UUID,
                    primaryKey: true,
                    defaultValue: Sequelize.UUIDV4
                },
                username: {
                    type: Sequelize.STRING,
                    defaultValue: Sequelize.UUIDV4,
                    allowNull: false,
                    unique: true
                },
                isGuest: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: true,
                    allowNull: false
                },
                playerId: {
                    type: Sequelize.STRING,
                    allowNull: true
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW
                }
            },
            {}
        ]
    },
    {
        fn: 'createTable',
        params: [
            'solvedProblems',
            {
                id: {
                    type: Sequelize.UUID,
                    primaryKey: true,
                    defaultValue: Sequelize.UUIDV4
                },
                userId: {
                    type: Sequelize.UUID,
                    references: {
                        model: 'users',
                        key: 'id'
                    }
                },
                problemId: {
                    type: Sequelize.UUID,
                    references: {
                        model: 'problems',
                        key: 'id'
                    }
                },
                code: {
                    type: Sequelize.TEXT
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW
                }
            },
            {}
        ]
    },
    {
        fn: 'createTable',
        params: [
            'images',
            {
                id: {
                    type: Sequelize.UUID,
                    primaryKey: true,
                    defaultValue: Sequelize.UUIDV4
                },
                type: {
                    type: Sequelize.TEXT
                },
                original: {
                    type: Sequelize.TEXT
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW
                }
            },
            {}
        ]
    },
    {
        fn: 'createTable',
        params: [
            'players',
            {
                id: {
                    type: Sequelize.UUID,
                    primaryKey: true,
                    defaultValue: Sequelize.UUIDV4
                },
                playerNumber: {
                    type: Sequelize.INTEGER
                },
                location: {
                    allowNull: true,
                    type: Sequelize.GEOMETRY('POINT')
                },
                userId: {
                    type: Sequelize.UUID,
                    references: {
                        model: 'users',
                        key: 'id'
                    }
                },
                gameId: {
                    type: Sequelize.UUID,
                    references: {
                        model: 'games',
                        key: 'id'
                    }
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW
                }
            },
            {}
        ]
    },
    {
        fn: 'createTable',
        params: [
            'resources',
            {
                id: {
                    type: Sequelize.UUID,
                    primaryKey: true,
                    defaultValue: Sequelize.UUIDV4
                },
                parent: {
                    type: Sequelize.TEXT
                },
                name: {
                    type: Sequelize.TEXT
                },
                count: {
                    type: Sequelize.INTEGER
                },
                playerId: {
                    allowNull: true,
                    type: Sequelize.UUID,
                    references: {
                        model: 'players',
                        key: 'id'
                    }
                },
                gameObjectId: {
                    allowNull: true,
                    type: Sequelize.UUID,
                    references: {
                        model: 'gameObjects',
                        key: 'id'
                    }
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW
                }
            },
            {}
        ]
    },
    {
        fn: 'createTable',
        params: [
            'bases',
            {
                id: {
                    type: Sequelize.UUID,
                    primaryKey: true,
                    defaultValue: Sequelize.UUIDV4
                },
                location: {
                    type: Sequelize.GEOMETRY('POINT')
                },
                hp: {
                    type: Sequelize.INTEGER
                },
                playerId: {
                    allowNull: true,
                    type: Sequelize.UUID,
                    references: {
                        model: 'players',
                        key: 'id'
                    }
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW
                }
            },
            {}
        ]
    }
];

module.exports = {
    pos: 0,
    up: function(queryInterface, Sequelize) {
        let index = this.pos;
        return new Promise(function(resolve, reject) {
            function next() {
                if (index < migrationCommands.length) {
                    let command = migrationCommands[index];
                    console.log('[#' + index + '] execute: ' + command.fn);
                    index++;
                    queryInterface[command.fn](...command.params).then(
                        next,
                        reject
                    );
                } else resolve();
            }
            next();
        });
    },
    info: info,
    down: function(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.dropTable('solvedProblems', {
                force: true,
                cascade: true
            }),
            queryInterface.dropTable('gameObjects', {
                force: true,
                cascade: true
            }),
            queryInterface.dropTable('problems'),
            queryInterface.dropTable('resources'),
            queryInterface.dropTable('bases'),
            queryInterface.dropTable('players', {
                force: true,
                cascade: true
            }),
            queryInterface.dropTable('users', {
                force: true,
                cascade: true
            }),
            queryInterface.dropTable('games', {
                force: true,
                cascade: true
            })
        ]);
    }
};
