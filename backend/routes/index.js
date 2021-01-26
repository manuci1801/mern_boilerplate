const userRoute = require("./users");

const combineRoute = (app) => {
  app.use("/api/users", userRoute);

  return app;
};

module.exports = combineRoute;
