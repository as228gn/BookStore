/**
 * @file Defines the AccountController class.
 * @module AccountController
 * @author Anna Ståhlberg
 */

import db from '../config/db.js'
import bcrypt from 'bcrypt'

/**
 * Encapsulates a controller.
 */
export class AccountController {
  /**
  * Returns a HTML form for register a user.
  *
  * @param {object} req - Express request object.
  * @param {object} res - Express response object.
  */
  async register(req, res) {
    res.render('account/register')
  }

   /**
   * Handles user registration.
   *
   * @param {object} req - The Express request object.
   * @param {object} res - The Express response object.
   * @param {Function} next - The next middleware function.
   */
   async postRegister(req, res, next) {
    try {
      const { fname, lname, address, city, zip, phone, email, password } = req.body

      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10)

      // Insert the new user into the database
      await db.query('INSERT INTO members (fname, lname, address, city, zip, phone, email, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [fname, lname, address, city, zip, phone, email, hashedPassword])
console.log("registartion succeded")
      res.redirect('./login')
    } catch (error) {
      console.error('Error during registration:', error)

      res.redirect('./register')
    }
  }

   /**
   * Returns a HTML form for login.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
   async login(req, res) {
    res.render('account/login')
  }
}
