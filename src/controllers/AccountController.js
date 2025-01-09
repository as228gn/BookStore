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
   async postRegister(req, res) {
    try {
      const { fname, lname, address, city, zip, phone, email, password } = req.body

      const [existingUser] = await db.query('SELECT email FROM members WHERE email = ?', [email]);
        
        if (existingUser.length > 0) {
          throw new Error('User already exists')
        }

        if (isNaN(req.body.zip)) {
          throw new Error('The zip code must be a number')
       }

      const hashedPassword = await bcrypt.hash(password, 10)

      await db.query('INSERT INTO members (fname, lname, address, city, zip, phone, email, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [fname, lname, address, city, zip, phone, email, hashedPassword])
      req.session.flash = { type: 'success', text: 'You have registered successfully!' }
      res.redirect('../')
    } catch (error) {
      req.session.flash = { text: error.message || 'Something went wrong, please try again.' }
      res.redirect('./register')
    }
  }

   /**
   * Function that logs in a member.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
   async postLogin(req, res) {
    try {
        const { email, password } = req.body;

        const [user] = await db.query('SELECT * FROM members WHERE email = ?', [email])

        if (user.length === 0) {
          throw new Error('Wrong password or email, please try again.')
        }

        const existingUser = user[0];

        const isPasswordValid = await bcrypt.compare(password, existingUser.password)
        if (!isPasswordValid) {
          throw new Error('Wrong password or email, please try again.')
        }
        req.session.userid = existingUser.userid

        req.session.flash = { type: 'success', text: 'Login were successfull' }
        res.redirect('../books/bookStore')
    } catch (error) {
      req.session.flash = { text: error.message || 'Something went wrong, please try again.' }
      res.redirect('../')
    }
}

  /**
   * Function that logout a member.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async logOut (req, res) {
    try {
      if (!req.session.userid) {
        throw new Error('No member to log out')
      }
      delete req.session.userid

      req.session.flash = { type: 'success', text: 'Logout were successfull' }
      res.redirect('../')
    } catch (error) {
      req.session.flash = { text: error.message || 'Something went wrong, please try again.' }
      res.redirect('../')
    }
  }
}
