if [ -f .env ]; then
    source <(sed -E -n 's/[^#]+/export &/ p' .env)
fi

sequelize db:seed:undo:all
sequelize db:seed:all