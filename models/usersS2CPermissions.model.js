module.exports = (sequelize, Sequelize) => {
  const usersS2CPermissions = sequelize.define(
    "usersS2CPermissions",
    {
      forUser: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      create: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      update: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },

      delete: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );

  return usersS2CPermissions;
};
