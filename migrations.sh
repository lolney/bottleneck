 #!/bin/bash

if [ ! -f .env ]; then
    source <(sed -E -n 's/[^#]+/export &/ p' .env)
fi

# First command sometimes deadlocks on first attempt
sequelize db:migrate:undo:all
while [ $? -ne 0 ]; do
    sleep 1
    sequelize db:migrate:undo:all
done
sequelize db:migrate
sequelize db:seed:undo:all
sequelize db:seed:all