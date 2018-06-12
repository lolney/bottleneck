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
    name: 'problem',
    created: '2018-06-12T04:32:27.056Z',
    comment: ''
};

let migrationCommands = [
    {
        fn: 'createTable',
        params: [
            'gameObjects',
            {
                id: {
                    type: Sequelize.UUID,
                    primaryKey: true,
                    defaultValue: Sequelize.UUIDV1
                },
                location: {
                    type: Sequelize.GEOMETRY
                },
                objectType: {
                    type: Sequelize.STRING
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                }
            },
            {}
        ]
    },
    {
        fn: 'createTable',
        params: [
            'problems',
            {
                id: {
                    type: Sequelize.UUID,
                    primaryKey: true,
                    defaultValue: Sequelize.UUIDV1
                },
                title: {
                    type: Sequelize.STRING
                },
                description: {
                    type: Sequelize.STRING
                },
                original: {
                    type: Sequelize.STRING
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false
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
    info: info
};
