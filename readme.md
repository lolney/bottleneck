[![Waffle.io - Columns and their card count](https://badge.waffle.io/lolney/bottleneck.svg?columns=all)](https://waffle.io/lolney/bottleneck)

Still early in development, but demo at [bottleneck-production.herokuapp.com](http://bottleneck-production.herokuapp.com/).

Latest build at [scripting-rpg.herokuapp.com](http://scripting-rpg.herokuapp.com/).

## Setup

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

Install postgis. On Ubuntu:

```
apt-get install postgis*
```

Install the Sequelize command line tools and pg module:

```
npm install -g sequelize-cli pg
```

Run migrations and seeders:

```
source .env
sequelize db:migrate:undo:all && sequelize db:migrate
sequelize db:seed:all
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
