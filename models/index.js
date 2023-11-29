const config = require("../config/db.config.js");
const Sequelize = require("sequelize");

// // Override timezone formatting for MSSQL
// Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
//   return this._applyTimezone(date, options).format("YYYY-MM-DD HH:mm:ss.SSS Z");
// };

let sequelize;

const loadSequelize = () => {
  const sequelize = new Sequelize(
    config.database,
    config.user,
    config.password,
    {
      ...config.settings,
      dialect: config.settings.dialect, // dialect needs to be explicitly supplied as of v4.0.0
    }
  );
  return sequelize;
};

const db = {};

try {
  sequelize = loadSequelize();
} catch (err) {
  console.log("loadSequelize Failed: " + err.message);
}

db.Sequelize = Sequelize; // Sequelize object
db.sequelize = sequelize; // instance
db.loadSequelize = loadSequelize;

// ******************************************
// *****  Below are the MODELS  *************
// ******************************************

db.genders = require("./genders.model.js")(sequelize, Sequelize);
db.Roles = require("./roles.model.js")(sequelize, Sequelize);
db.Login = require("./login.model.js")(sequelize, Sequelize);



db.Users = require("./users.model.js")(sequelize, Sequelize);




db.usersS2CPermissions = require("./usersS2CPermissions.model")(
  sequelize,
  Sequelize
);
db.s2cPermissionsCategory = require("./s2cPermissionsCategory.model")(
  sequelize,
  Sequelize
);

db.userPermissions = require("./userPermissions.model.js")(
  sequelize,
  Sequelize
);

db.Roles = require("./roles.model")(sequelize, Sequelize);

db.Users.belongsTo(db.Roles, { foreignKey: "roleId" });
db.Login.belongsTo(db.Users, { foreignKey: "userId", onDelete: "CASCADE" });

db.Users.hasOne(db.Login, { foreignKey: "userId" });


db.userPermissions.belongsTo(db.Users, { foreignKey: "userId" });

db.usersS2CPermissions.belongsTo(db.Users, {
  foreignKey: "userId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

db.usersS2CPermissions.belongsTo(db.s2cPermissionsCategory, {
  foreignKey: "permissionId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});


module.exports = db;
