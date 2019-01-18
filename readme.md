[![Waffle.io - Columns and their card count](https://badge.waffle.io/lolney/bottleneck.svg?columns=all)](https://waffle.io/lolney/bottleneck)
![build](https://travis-ci.org/lolney/bottleneck.svg?branch=master)

# Bottleneck

Bottleneck is an open source, RTS-inspired game about efficiently automating the management of your base. Collect resources by solving naturally-integrated programming problems, which you can use to build defenses or break down your opponent's. Win by gathering enough creeps to circumvent those defenses and breach your opponent's keep.

Preview:
![](https://i.imgur.com/d3UhZJu.jpg)

Alpha demo at [www.bottleneck.world](https://www.bottleneck.world/).

Latest build at [scripting-rpg.herokuapp.com](http://scripting-rpg.herokuapp.com/).

## API Documention

Communication between the game server and client is handled with a websockets (socket.io) API, unifying the channel for event subscription and requests/responses.

### Request/Response

Like event subscriptions, but response is intended only for a single target. Responses are returned through socket.io acks.

Usage:

```
// initiating end
const response = await socket.request(eventname: string, data?: any)
if(response.type == Response.SUCCESS) {
    const {type, data} = response;
}
```

```
// responding end
socket.transaction(eventname: string, (data?: any) => Response)
```

Response format:

```
{
    type: 'ERROR' | 'SUCCESS';
    data?: {}; // if 'ERROR'
    msg?: string; // if 'SUCCESS'
}
```

#### Events:

`resourceInitial`

Get a dictionary of resource names -> counts.

- request data: `{}`
- errors: ``
- response data:

```
{
    [name: string]: number;
}
```

`solvedProblems`

Get a list of solved problems.

- request data: `{}`
- errors: ``
- response data: `Array<SolvedProblem>`

```
type SolvedProblem = {
    code: string;
    problemId: string;
    problem: BinaryTreeProblem | ImageProblem;
}
```

`siegeItems`

Get a list of available siege items.

- request data: `{}`
- errors: ``
- response data: `Array<SiegeItem>`

`makeDefense`

Post a new defense.

- request data: `{}`
- errors: `InvalidDefenseError | NotEnoughResourcesError`
- response data: `{position: {x: number; y: number;}, dbId: string;}`

`mergeDefenses`

Post a new offense (countering a defense).

- request data: `{}`
- errors: `InvalidOffenseError | InvalidGameObjectError | NotEnoughResourcesError`
- response data: `{}`

`makeAssaultBot`

Post a new assault bot (counter)

- request data: `{}`
- errors: `NotEnoughResourcesError`
- response data: `{count: number;}`

### Client-side Event Subscriptions:

The client can listen for these events.

Client subscribes with `socket.<on|once>(<eventName>)`. Events are either `targeted` (sent to a single client) or `broadcast` (send to all targets).

`solution`

Reflects a solution by some player, whose socket playerId (recorded server-side as `playerNumber`) is given by `playerId` and whose database problemId is given by `problemId`.

- target: `broadcast`
- data:

```
{
    problemId: string;
    playerId: number;
}
```

`gameWin`

Reflects a win by the targeted player.

- target: `targeted`
- data: `{}`

`gameLose`

Reflects a loss by the targeted player.

- target: `targeted`
- data: `{}`

`resourceUpdate`

Reflects a change in a player's resources, given as a delta (either positive or negative).

- target: `targeted`
- data:

```
{
    name: string;
    count: number;
    shouldReset: boolean;
}
```

`problem`

Reflects a problem that a player can solve, sent when the player approaches a resource.

- target: `targeted`
- data: `BinaryTreeProblem | ImageProblem`

`gameState`

Reflects a change in the game state, as described by the state field.

- target: `broadcast`
- data: `state: 'initializing' | 'suspended' | 'inProgress' | 'done'`

`assaultBotCount`
`collectionBotCount`

Reflects the current player's bot count (of, respectively, assault bots or collection bots), broadcast on change.

- target: `targeted`
- data: `{ botCount: number; }`

`hp`

Reflects a change in the HP of a base.

- target: `broadcast`
- data: `{myHp: number;} | {enemyHp: number;}`

### Server-side Event Subscriptions:

The server listens for these events.

Client emits with `socket.emit(<eventName>, data)`

`solution`

Submit a solution to the server.

- data:

```
{
    problemId: string;
    code: string;
}
```

## Development Setup

### Install dependencies:

```
npm install
```

### Setting up the Database:

Install Postgres and create the database `bottleneck_development`.
Create a .env file at the project root, containing:

```
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/bottleneck_development
```

Install postgis. For instance, on Debian/Ubuntu:

```
apt-get install postgis*
```

Install the Sequelize command line tools and pg module:

```
npm install -g sequelize-cli pg
```

Run migrations and seeders:

```
bash migrations.sh
```

Note: to generate migrations:

```
cd src/server/db
babel-node ../../../node_modules/sequelize-auto-migrations/bin/makemigration --name problem
```

Note that this has some bugs - need to change `GEOMETRY` to `Sequelize.GEOMETRY` manually, and doesn't create the `down` methods.

### Build and run:

npm run-script build
npm start

### Running tests:

```
npm test
```

Storybook tests:

```
npm run storybook
```
