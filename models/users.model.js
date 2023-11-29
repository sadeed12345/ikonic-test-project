module.exports = (sequelize, Sequelize) => {
  const Users = sequelize.define(
    "users",
    {
      firstName: {
        type: Sequelize.STRING(21),
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING(21),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(500),
        allowNull: false,
        unique: "uc_users_email",
      },
      registrationDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      genderId: {
        type: Sequelize.INTEGER,
        allowNull: true, // Set to false if gender is a required field
        references: {
          model: 'genders', // Assumes you have a 'genders' table
          key: 'id',
        },
      },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles', // Assumes you have a 'roles' table
          key: 'id',
        },
      },
      // Include any other additional fields as required
    },
    {
      freezeTableName: true,
      timestamps: true,
    }
  );

  return Users;
};
