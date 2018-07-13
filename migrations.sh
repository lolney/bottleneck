 #!/bin/bash

source <(sed -E -n 's/[^#]+/export &/ p' .env)

sequelize db:migrate:undo:all
sequelize db:migrate
sequelize db:seed:undo:all
sequelize db:seed:all