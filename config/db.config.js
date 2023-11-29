const config = {
  user: process.env.sequelizeUSER,
  password: process.env.sequelizePW,
  database: process.env.sequelizeDB,
  settings: {
    // ** Any Key:Value added here will automatically be added to sequelize instance ** //
    host: process.env.sequelizeHOST, // server
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // "Europe/Berlin",
    dialect: "mssql",
    port: 1433,
    // logging: process.env.sequelizeLogFlag == "true" ? console.log() : false, //should be either a function or false.
    logging: process.env.sequelizeLogFlag == "true",
    ssl: true,
    options: {
      trustedConnection: true,
      trustServerCertificate: true,
      Encrypt: true,
      IntegratedSecurity: true,
    },
    dialectOptions: {
      // useUTC: false, //for reading from database
      // dateStrings: true,
      // typeCast: true
      options: { requestTimeout: 6000 },
    },
    pool: {
      max: 2,
      min: 0,
      // acquire: 3000,
      // idle: 1000,
      // evict: 6000, // CURRENT_LAMBDA_FUNCTION_TIMEOUT,
      // // maxUses: 1000, // default Infinity
    },
  },
};

module.exports = config;
