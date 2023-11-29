const customConfigurations = {
  emailRegex: "^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$",
  contactNumberRegexp: "^[0-9]+$",
  expressSessionSecret: process.env.sessionSecret || "254ABHbV2STbngTgzaT4", //'some-very-long-secret'
  aesSecretKey: process.env.aesKey, //'some-very-long-secret'
  tokenExpiryInMinutes: process.env.tokenExpiryInMinutes,

};


module.exports = customConfigurations;
