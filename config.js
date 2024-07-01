/** Common config for message.ly */

// read .env files and make environmental variables

require("dotenv").config();

const DB_URI = (process.env.NODE_ENV === "test")
  ? {host:"localhost", port:5432, database:"messagely_test", user:"postgres", password:"postgres"}
  : {host:"localhost", port:5432, database:"messagely", user:"postgres", password:"postgres"};

const SECRET_KEY = process.env.SECRET_KEY || "secret";

const BCRYPT_WORK_FACTOR = 12;


module.exports = {
  DB_URI,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
};