[![Waffle.io - Columns and their card count](https://badge.waffle.io/lolney/bottleneck.svg?columns=all)](https://waffle.io/lolney/bottleneck)

# Bottleneck

Bottleneck is an open source, RTS-inspired game based around efficiently automating the management of your base. Collect resources by solving naturally-integrated programming problems, which you can use to build defenses or break down your opponent's. Win by gathering enough creeps to circumvent those defenses and breach your opponent's keep.

Preview:
![](https://i.imgur.com/d3UhZJu.jpg)

Pre-alpha demo at [bottleneck-production.herokuapp.com](http://bottleneck-production.herokuapp.com/).

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
