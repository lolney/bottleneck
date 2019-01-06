export default (gameApi) => [
    {
        text:
            'Welcome to Bottleneck! To progress, you’ll have to unlock some resources.',
        nextTrigger: {
            type: 'close'
        }
    },
    {
        text: 'Go to that rock to solve the problem that\'s locking it.',
        arrow: {
            type: 'game object',
            target: 'nearest'
        },
        nextTrigger: {
            type: 'event',
            eventName: 'solution',
            eventType: 'client'
        }
    },
    {
        text: 'Now you can work on assaulting the opponent\'s base.',
        nextTrigger: {
            type: 'close'
        }
    },
    {
        text: 'Buy an assault bot by clicking on the button to the right.',
        arrow: {
            type: 'dom object',
            target: 'btn-assault-bot',
            direction: 'bottom'
        },
        nextTrigger: {
            type: 'event',
            eventName: 'makeAssaultBot',
            eventType: 'req'
        }
    },
    {
        text:
            'The assault bot will attack the opponent’s base, lowering its HP by 10.',
        nextTrigger: {
            type: 'close'
        }
    },
    {
        text:
            'But to get to the opponent’s base, you’ll have to create a route through the moat in the center.',
        nextTrigger: {
            type: 'close'
        }
    },
    {
        text:
            'Buy a bridge from the siege tools shop by dragging it to the gap in the center.',
        arrow: {
            type: 'coordinates',
            target: {
                x: gameApi.getCenter().x,
                y: gameApi.getCenter().y
            }
        },
        nextTrigger: {
            type: 'event',
            eventName: 'mergeDefenses',
            eventType: 'req'
        }
    },
    {
        text:
            'You did it! Now you can wait for the bot to reach your opponent\'s base.',
        nextTrigger: {
            type: 'event',
            eventName: 'hp',
            eventType: 'server'
        }
    },
    {
        text:
            'The bot got to the base! It reduced your opponent\'s HP by a bit.',
        arrow: {
            type: 'dom object',
            target: 'enemyHp-bar',
            direction: 'bottom'
        },
        nextTrigger: {
            type: 'close'
        }
    },
    {
        text:
            'To finish, you need to buy 4 more bots and wait for them to assault the base.',
        arrow: {
            type: 'dom object',
            target: 'btn-assault-bot',
            direction: 'bottom'
        },
        nextTrigger: {
            type: 'event',
            eventName: 'gameWin',
            allowedEvents: ['makeAssaultBot', 'solution'],
            eventType: 'server'
        }
    },
    {
        text:
            'You won! If you want more of a challenge, you can try the vs. mode to play against other humans.',
        nextTrigger: {
            type: 'close'
        }
    }
];
