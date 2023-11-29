module.exports = (sequelize, Sequelize) => {
  const s2cPermissionsCategory = sequelize.define(
    "s2cPermissionsCategory",
    {
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING(1000),
        allowNull: true,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );

  return s2cPermissionsCategory;
};
