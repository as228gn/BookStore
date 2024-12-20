/**
 * @file Defines the BookController class.
 * @module BookController
 * @author Anna Ståhlberg
 */

import db from '../config/db.js'
import bcrypt from 'bcrypt'

/**
 * Encapsulates a controller.
 */
export class BookController {

   /**
  * Returns a HTML form for searching books.
  *
  * @param {object} req - Express request object.
  * @param {object} res - Express response object.
  */
   async bookSearch(req, res) {
    res.render('books/bookSearch')
  }

}