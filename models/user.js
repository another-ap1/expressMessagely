/** User class for message.ly */
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config")
const db = require("../db");
const ExpressError = require("../expressError");


/** User of the site. */

class User {

  static async register({username, password, first_name, last_name, phone}) {
    
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const results = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
      VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
      RETURNING username`, 
      [username, hashedPassword, first_name, last_name, phone]);

      return results.rows[0];
   }


  static async authenticate(username, password) {
    let pwd = await db.query(`SELECT password FROM users WHERE username = $1`, [username]);
    
    if (!pwd){
      return new ExpressError("invalid username/password", 400);
    }

    pwd = pwd.rows[0];
    return bcrypt.compare(password, pwd.password);

   }


  static async updateLoginTimestamp(username) { 
    const results = await db.query(`UPDATE users SET last_login_at=current_timestamp WHERE username=$1 RETURNING username`, [username]);
    if(!results.rows[0]){
      return new ExpressError("user not found", 400);
    }
  }


  static async all() {
    const results = await db.query(`SELECT username, first_name, last_name, photo
      FROM users`);
    return results.rows;
   }


  static async get(username) {
    const result = await db.query(`SELECT 
      username, first_name, last_name, photo, join_at, last_login
      FROM users
      WHERE username=$1`,[username]);
    
    if(!result.row[0]){
      return new ExpressError('user not found', 401);
    }

    return result.rows[0];
   }


  static async messagesFrom(username) { 
    const results = await db.query(`SELECT
      id, to_username, first_name, last_name, phone, body, sent_at, read_at
      FROM messages
      JOIN users ON messages.to_username=users.username
      WHERE from_username=$1`,[username]);

      return results.rows.map(m => ({
        id: m.id, to_user: {username: m.to_username, first_name: m.first_name, 
        last_name: m.last_name, phone: m.phone}, body: m.body, sent_at: m.sent_at, read_at: m.read_at
    }));
  }

 
  static async messagesTo(username) { 
    const results = await db.query(`SELECT 
      id, from_username, first_name, last_name, phone, body, sent_at, read_at 
      FROM messages 
      JOIN users ON messages.from_username=users.username 
      WHERE to_username=$1`, 
      [username]);

    return results.rows.map(m => ({
      id: m.id, from_user: {username: m.from_username, first_name: m.first_name, 
      last_name: m.last_name, phone: m.phone}, body: m.body, sent_at: m.sent_at, read_at: m.read_at
  }))
  }
}


module.exports = User;