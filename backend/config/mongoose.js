const mongoose = require("mongoose");
const { MONGO_URI } = require("./keys");

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.log(error);
  }
};

module.exports = { connectDB };
