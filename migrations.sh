 #!/bin/bash

if [! -f .env]; then
    source <(sed -E -n 's/[^#]+/export &/ p' .env)
fi

# First command sometimes deadlocks on first attempt
sequelize db:migrate:undo:all || sequelize db:migrate:undo:all
sequelize db:migrate
sequelize db:seed:undo:all
sequelize db:seed:all