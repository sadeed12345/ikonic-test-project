module.exports = (sequelize, Sequelize) => {
  const Login = sequelize.define(
    "login",
    {
      userName: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: "uc_login_userName",
      },
      password: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,  // Set to true or false based on your application's logic
      },
      
    },
    {
      freezeTableName: true,
      timestamps: true, // Enable timestamps if you want to track createdAt and updatedAt
    }
  );

  return Login;
};
