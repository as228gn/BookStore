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

      const [existingUser] = await db.query('SELECT email FROM members WHERE email = ?', [email]);
        
        if (existingUser.length > 0) {
            // E-post finns redan
            console.error('E-postadressen används redan.');
            res.status(400).send('E-postadressen används redan.');
            return;
        }

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
   * Function that logs in a member.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
   async postLogin(req, res, next) {
    try {
        const { email, password } = req.body;

        // Kontrollera om användaren finns
        const [user] = await db.query('SELECT * FROM members WHERE email = ?', [email]);

        if (user.length === 0) {
            // Ingen användare hittades
            console.error('Ingen användare med den här e-postadressen.');
            res.status(400).send('Felaktig e-postadress eller lösenord.');
            return;
        }

        const existingUser = user[0];

        // Kontrollera om lösenordet stämmer
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            console.error('Fel lösenord.');
            res.status(400).send('Felaktig e-postadress eller lösenord.');
            return;
        }

        // Inloggning lyckades
        console.log('Inloggning lyckades:', existingUser.email);
        res.redirect('../books/bookSearch'); // Omdirigera till en skyddad sida
    } catch (error) {
        console.error('Fel vid inloggning:', error);
        res.status(500).send('Ett fel uppstod. Försök igen senare.');
    }
}
}
