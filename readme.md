[![Waffle.io - Columns and their card count](https://badge.waffle.io/lolney/bottleneck.svg?columns=all)](https://waffle.io/lolney/bottleneck)

Still early in development, but demo at scripting-rpg.herokuapp.com

## Setup

### Install dependencies:

```
npm install
```

### Setting up the Database:

Install Postgres.
Create the database `bottleneck_development`.
Create the file src/db/config/config.json, containing:

```
{
    "development": {
        "username": USERNAME,
        "password": PASSWORD,
        "database": "bottleneck_development",
        "host": "127.0.0.1",
        "dialect": "postgres"
    }
}
```

Install postgis. On Ubuntu:

```
apt-get install postgis*
```

Run migrations:

```
sequelize db:migrate
```

Note: to generate migrations:

```
cd /src/server/db
babel-node ../../../node_modules/sequelize-auto-migrations/bin/makemigration --name problem
```

### Build and run:

npm run-script build
npm start

### Running tests:

```
npm test
```
