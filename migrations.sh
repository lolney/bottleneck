 #!/bin/bash

if [ -f .env ]; then
    source <(sed -E -n 's/[^#]+/export &/ p' .env)
fi

# First command sometimes deadlocks on first attempt
loops=1
sequelize db:migrate:undo:all
while [ $? -ne 0 ]; do
    if [ $loops -eq 5 ]
    then
        >&2 echo "ERROR: Migrate still failing after 5 attempts"
        exit 1
    fi
    loops=$[$loops+1]

    sleep 1
    sequelize db:migrate:undo:all
done
sequelize db:migrate
sequelize db:seed:undo:all
sequelize db:seed:all