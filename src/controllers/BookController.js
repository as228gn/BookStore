/**
 * @file Defines the BookController class.
 * @module BookController
 * @author Anna Ståhlberg
 */

import db from '../config/db.js'

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
  async getSubjects(req, res) {
    const query = `SELECT DISTINCT subject FROM books ORDER BY subject ASC`;

    try {
      const [results] = await db.query(query);
      res.render('books/subject', { subjects: results });
    } catch (error) {
      console.error('Error fetching subjects: ', error.message);
      res.status(500).render('error', { message: 'Failed to fetch subjects.' });
    }
  }

  /**
  * Returns a HTML form for the startpage of the bookstore.
  *
  * @param {object} req - Express request object.
  * @param {object} res - Express response object.
  */
  async getBooksBySubject(req, res) {
    const subject = req.params.id
    const page = parseInt(req.params.page) || 1
    const limit = 10
    const offset = (page - 1) * limit

    const query = `SELECT * FROM books WHERE subject = ? ORDER BY title LIMIT ? OFFSET ?`
    const countQuery = `SELECT COUNT(*) AS total FROM books WHERE subject = ?`

    try {
      const [results] = await db.query(query, [subject, limit, offset])
      const [[{ total }]] = await db.query(countQuery, [subject])

      const totalPages = Math.ceil(total / limit)

      const viewData = {
        books: results,
        subject: subject,
        currentPage: page,
        pages: totalPages, 
        totalBooks: total
      }

      res.render('books/showBooks', {viewData})
    } catch (error) {
      console.error('Error fetching books: ', error.message);
      res.status(500).json({ error: 'Failed to fetch books.' });
    }

  }
}