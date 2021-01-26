const Redis = require("ioredis");

// port: 13719,
// host: "redis-13719.c11.us-east-1-3.ec2.cloud.redislabs.com",
// family: 4,
// password: "I1H5FUg1OtOGIkq7f6sp2kp3scgL0FjJ",

const redis = new Redis();

const redisClient = (function redisConfig() {
  redis.on("error", function (error) {
    console.error(error);
  });

  redis.on("connect", function () {
    console.log("Redis connected");
  });
  return redis;
})();

module.exports = redisClient;
