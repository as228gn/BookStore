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
 * Returns a HTML form for the startpage of the bookstore.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
  async bookStart(req, res) {
    res.render('books/bookStore')
  }

  /**
* Returns a HTML form for the startpage of the bookstore.
*
* @param {object} req - Express request object.
* @param {object} res - Express response object.
*/
  async searchBySubject(req, res) {
    const query = `SELECT DISTINCT subject FROM books ORDER BY subject ASC`;

    try {
      const [results] = await db.query(query);
      res.render('books/subject', { subjects: results });
    } catch (error) {
      console.error('Error fetching subjects: ', error.message);
      res.status(500).render('error', { message: 'Failed to fetch subjects.' });
    }
  }

  async postSearchBySubject(req, res) {
    const { subject } = req.body;
    const query = `SELECT * FROM books WHERE subject = ? ORDER BY author ASC` // ? används som en platsreserv
    try {
      const [results] = await db.query(query, [subject]); // Säkerställ att subject sätts som en parameter
      res.render('books/showBooks', { books: results }); // Returnerar böcker som JSON, kan ändras till render om du visar en vy
    } catch (error) {
      console.error('Error fetching books: ', error.message);
      res.status(500).json({ error: 'Failed to fetch books.' });
    }
  }

  async showBooks(req, res) {
    res.render('books/showBooks')
  }

}