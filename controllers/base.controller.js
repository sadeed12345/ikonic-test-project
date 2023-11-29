const {
  handleErrorResponse,
  ErrorHandler,
} = require("../handlers/errorHandler");

// Retrieve User from session
exports.getUserFromSession = async (req, res) => {
  try {
    const db = req.db;

    const _userId = req.session.userInfo.userId;

    // Get Friends
    const _requestedRolesList = [1, 2, 3, 4, 5];
    const _requestedStatusList = [20];
    let _notConnectedStatus = -1;
    const _today = new Date();

    _requestedStatusList.includes(0) == true
      ? (_notConnectedStatus = 0)
      : (_notConnectedStatus = -1); // 0 is status for Not connected

    const friends = await db.sequelize
      .query(
        `-- userId as Sender        
        SELECT receiver.id, receiver.firstName, receiver.lastName, city=city.name , receiver.roleId, [role].roleName, receiver.picture, 
                connection.statusCode, status=CASE WHEN connection.statusCode=10 THEN 'RequestSent' ELSE cs.status END, 
                currentTask = [plan].type, connection.createdAt, connection.updatedAt
        FROM connections AS connection
        JOIN users AS mySelf ON mySelf.id = :userId -- myself as Sender  
        JOIN ROLES AS myRole ON myRole.id = mySelf.roleId
        JOIN users AS receiver ON receiver.id = connection.receiver
        JOIN ROLES AS [role] ON [role].id = receiver.roleId
        JOIN connectionStatuses cs ON cs.statusCode = connection.statusCode
        JOIN UserAddresses AS userAddress ON userAddress.userId = receiver.id
        JOIN cities AS city ON city.id = userAddress.cityId

        LEFT JOIN schedulerUsers AS [planUser] ON [planUser].userId = receiver.id 
        LEFT JOIN planScheduler AS [plan] ON [plan].id = [planUser].schedulerId 
            AND [plan].openTask = 0  
            AND CAST( :today AS DateTimeOffset) BETWEEN [plan].startDate AND DateAdd(MINUTE, - 1, [plan].endDate)

        WHERE [connection].[sender] = :userId
            AND connection.statusCode <> 40 -- Receiver has blocked given userId
          -- AND mySelf.roleId != receiver.roleId
          AND receiver.roleId IN (:requestedRolesList) -- requested roles
          AND connection.statusCode in (:requestedStatusList) -- requested statuses
                        
        UNION
                        
        -- userId as Receiver
        SELECT sender.id, sender.firstName, sender.lastName, city=city.name , sender.roleId, [role].roleName, sender.picture, 
                connection.statusCode, status=CASE WHEN connection.statusCode=10 THEN 'RequestReceived' ELSE cs.status END, 
                currentTask = [plan].type, connection.createdAt, connection.updatedAt
        FROM connections AS connection
        JOIN users AS mySelf ON mySelf.id = :userId -- myself as Receiver
        JOIN ROLES AS myRole ON myRole.id = mySelf.roleId
        JOIN users AS sender ON sender.id = connection.sender
        JOIN ROLES AS [role] ON [role].id = sender.roleId
        JOIN connectionStatuses cs ON cs.statusCode = connection.statusCode
        JOIN UserAddresses AS userAddress ON userAddress.userId = sender.id
        JOIN cities AS city ON city.id = userAddress.cityId

        LEFT JOIN schedulerUsers AS [planUser] ON [planUser].userId = sender.id 
        LEFT JOIN planScheduler AS [plan] ON [plan].id = [planUser].schedulerId 
          AND [plan].openTask = 0 
          AND CAST( :today AS DateTimeOffset) BETWEEN [plan].startDate AND DateAdd(MINUTE, - 1, [plan].endDate)

        WHERE [connection].[receiver] = :userId 
          AND connection.statusCode <> 30 -- sender has blocked given userId
          -- AND mySelf.roleId != sender.roleId
          AND sender.roleId IN (:requestedRolesList) -- requested roles
          AND connection.statusCode in (:requestedStatusList) -- requested statuses
                
        UNION
                
        -- all other users with NO interaction with userId
        SELECT [user].id, [user].firstName, [user].lastName, city=city.name, [user].roleId , [role].roleName, [user].picture, statusCode=0, [status]=Null,
                currentTask = [plan].type, createdAt= Null, updatedAt = Null
        FROM users AS [user]
        JOIN users AS mySelf ON mySelf.id = :userId -- myself
        JOIN ROLES AS myRole ON myRole.id = mySelf.roleId
        JOIN ROLES AS [role] ON [role].id = [user].roleId
        JOIN UserAddresses AS userAddress ON userAddress.userId = [user].id
        JOIN cities AS city ON city.id = userAddress.cityId

        LEFT JOIN schedulerUsers AS [planUser] ON [planUser].userId = [user].id 
        LEFT JOIN planScheduler AS [plan] ON [plan].id = [planUser].schedulerId 
          AND [plan].openTask = 0 
          AND CAST( :today AS DateTimeOffset) BETWEEN [plan].startDate AND DateAdd(MINUTE, - 1, [plan].endDate)

        WHERE [user].id != :userId
          -- AND mySelf.roleId != [user].roleId
          AND [user].roleId IN (:requestedRolesList) -- requested roles
          AND [user].id NOT IN ( SELECT id = receiver FROM connections
                                  WHERE sender = :userId
                                
                                  UNION
                                
                                  SELECT id = sender FROM connections
                                  WHERE receiver = :userId
                                )
          AND 1 = CASE WHEN :notConnectedStatus = 0 THEN 1 ELSE 0 END
        ORDER BY connection.updatedAt DESC, currentTask DESC`,
        {
          type: db.Sequelize.QueryTypes.SELECT,
          replacements: {
            userId: _userId,
            requestedRolesList: _requestedRolesList,
            requestedStatusList: _requestedStatusList,
            notConnectedStatus: _notConnectedStatus,
            today: _today,
          },
        }
      )
      .then((data) => {
        //for removing duplicate person who has multiple schedulers at the same time
        const connectionIds = new Set();
        const connections = [];
        data.map((elem) => {
          if (!connectionIds.has(elem.id)) {
            connectionIds.add(elem.id);
            connections.push(elem);
          }
        });
        return connections;
      })
      .catch((err) => {
        return handleErrorResponse(err, res, "connections");
      });

    // Get Todos
    // We check if the user does not have any connections
    const connections = await db.sequelize
      .query(
        `
       Select * from connections where (sender = $userId or receiver = $userId) and statusCode = 20
       `,
        {
          bind: { userId: _userId },
          type: db.Sequelize.QueryTypes.SELECT,
        }
      )
      .then(async (data) => {
        if (data.length > 0) {
          // Lets check immediately if we have the OT for this
          await db.PlanScheduler.findOne({
            where: {
              forUser: _userId,
              title: "Have your first connection",
            },
          })
            .then(async (data) => {
              if (data) {
                db.PlanScheduler.destroy({
                  where: {
                    id: data.id,
                  },
                }).catch((err) => {
                  return handleErrorResponse(
                    err,
                    res,
                    "deleteUserGeoFence: OT creation"
                  );
                });
              }
            })
            .catch((err) => {
              return handleErrorResponse(
                err,
                res,
                "deleteUserGeoFence: OT Err"
              );
            });
        }
        return data;
      })
      .catch((err) => {
        return handleErrorResponse(err, res, "getTodos: connections");
      });

    // We need to check if there are any geofence
    const myGeofences = await db.userGeoFences
      .findAll({
        where: {
          userId: _userId,
        },
      })
      .then((data) => {
        return data;
      })
      .catch((err) => {
        return handleErrorResponse(err, res, "getTodos: geofences");
      });
    // Lets check if there are any external credentials
    const externalCredentials = await db.externalCredentials
      .findAll({
        where: {
          userId: _userId,
        },
      })
      .then((data) => {
        return data;
      })
      .catch((err) => {
        return handleErrorResponse(err, res, "getTodos: externalCredentials");
      });

    // Make sure to get the permissions of the user!
    const permissions = await db.sequelize
      .query(
        `
         SELECT uc.name, up.[create], up.[read], up.[update], up.[delete], u.id, u.firstName, u.lastName from usersS2CPermissions up 
         RIGHT JOIN s2cPermissionsCategory uc on uc.id = up.permissionId
         RIGHT JOIN users u on u.id = up.userId
         where forUser = $userId
     `,
        {
          bind: { userId: _userId },
          type: db.Sequelize.QueryTypes.SELECT,
          raw: true,
        }
      )
      .then((data) => {
        return data;
      })
      .catch((err) => {
        return handleErrorResponse(err, res, "Login - permissions");
      });

    const settings = await db.usersS2CSettings
      .findAll({
        where: {
          userId: _userId,
        },
        attributes: [
          "timeZone",
          "startDayDate",
          "endDayDate",
          "dateFormat",
          "unitSystem",
          "theme",
        ],
      })
      .then((data) => {
        return data;
      })
      .catch((err) => {
        return handleErrorResponse(err, res, "Login - settings");
      });

    // Get User Details
    await db.Users.findByPk(_userId, {
      attributes: [
        ["id", "userId"], // id as userId
        "firstName",
        "lastName",
        "email",
        "picture",
        "roleId",
      ],
      raw: true,
    })
      .then((data) => {
        return res.send({
          userData: data,
          friends: friends,
          todos: {
            Connections: connections.length === 0 ? true : false,
            Settings: {
              S2CSettings: myGeofences.length === 0 ? true : false,
              ExternalCredentials:
                externalCredentials.length === 0 ? true : false,
            },
          },
          permissions: permissions,
          settings: settings,
        });
      })
      .catch((err) => {
        return handleErrorResponse(err, res, "getUserFromSession");
      });
  } catch (err) {
    return handleErrorResponse(err, res, "getUserFromSession");
  }
};
