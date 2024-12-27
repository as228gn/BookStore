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
    const limit = 5
    const offset = (page - 1) * limit
    const currentUrl = req.originalUrl

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
        totalBooks: total,
        currentUrl: currentUrl
      }

      res.render('books/showBooks', {viewData})
    } catch (error) {
      console.error('Error fetching books: ', error.message);
      res.status(500).json({ error: 'Failed to fetch books.' });
    }

  }

  async addToCart(req, res) {
    const isbn = req.body.isbn
    const userId = req.session.userid
    const redirectUrl = req.body.redirectUrl

    const query = `INSERT INTO cart (userId, isbn, qty) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE qty = qty + 1`

try {
    // Kör SQL-frågan
    await db.query(query, [userId, isbn])
    req.session.flash = { type: 'success', text: 'Book added to cart.' }
    res.redirect(redirectUrl)
} catch (error) {
    console.error('Error updating cart:', error.message);
    res.status(500).render('error', { message: 'Ett fel uppstod när boken skulle läggas till i kundvagnen.' })
}

  }
}