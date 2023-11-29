module.exports = (sequelize, Sequelize) => {
  const Roles = sequelize.define(
    "roles",
    {
      roleName: {
        type: Sequelize.STRING(25),
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );

  return Roles;
};
