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
  * Returns the page for showing the subjects.
  *
  * @param {object} req - Express request object.
  * @param {object} res - Express response object.
  */
  async getSubjects(req, res) {
    const query = `SELECT DISTINCT subject FROM books ORDER BY subject ASC`;

    try {
      const [results] = await db.query(query);
      res.render('books/subject', { subjects: results })
    } catch (error) {
      req.session.flash = { text: 'Failed to fetch subjects, please try again.' }
      res.redirect('books/bookStore')
    }
  }

  /**
  * Shows the books in the choosen subject.
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

      res.render('books/showBooks', { viewData })
    } catch (error) {
      req.session.flash = { text: 'Failed to fetch books, please try again.' }
      res.redirect('books/bookStore')
    }

  }

  /**
 * Returns a HTML form for searching a book by author or title.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
  async getAuthorTitlePage(req, res) {
    res.render('books/authorTitle')
  }

  /**
* Shows the book by the choosen author/title.
*
* @param {object} req - Express request object.
* @param {object} res - Express response object.
*/
  async getBooksBySearch(req, res) {
    try {

      const searchCriteria = req.query.searchCriteria
      const searchInput = req.query.searchInput
      const page = parseInt(req.query.page) || 1
      const limit = 5
      const offset = (page - 1) * limit
      const currentUrl = req.originalUrl
      const search = '%' + searchInput + '%'

      if (searchCriteria == 'author') {
        const query = `SELECT * FROM books WHERE author LIKE ? ORDER BY title LIMIT ? OFFSET ?`
        const countQuery = `SELECT COUNT(*) AS total FROM books WHERE author LIKE ?`

        const [results] = await db.query(query, [search, limit, offset])
        const [[{ total }]] = await db.query(countQuery, [search])

        const totalPages = Math.ceil(total / limit)

        const viewData = {
          books: results,
          currentPage: page,
          pages: totalPages,
          totalBooks: total,
          searchCriteria: searchCriteria,
          searchInput: searchInput,
          currentUrl: currentUrl
        }
        res.render('books/searchResult', { viewData })

      } else if (searchCriteria == 'title') {
        const query = `SELECT * FROM books WHERE title LIKE ? ORDER BY title LIMIT ? OFFSET ?`
        const countQuery = `SELECT COUNT(*) AS total FROM books WHERE title LIKE ?`

        const [results] = await db.query(query, [search, limit, offset])
        const [[{ total }]] = await db.query(countQuery, [search])

        const totalPages = Math.ceil(total / limit)

        const viewData = {
          books: results,
          currentPage: page,
          pages: totalPages,
          totalBooks: total,
          searchCriteria: searchCriteria,
          searchInput: searchInput,
          currentUrl: currentUrl
        }
        res.render('books/searchResult', { viewData })
      }
    } catch (error) {
      req.session.flash = { text: 'Failed to show books, please try again.' }
      res.redirect('books/bookStore')
    }

  }

/**
* Adds the choosen book to the cart.
*
* @param {object} req - Express request object.
* @param {object} res - Express response object.
*/
  async addToCart(req, res) {
    const isbn = req.body.isbn
    const userId = req.session.userid
    const redirectUrl = req.body.redirectUrl

    try {
      if (userId == null) {
        throw error
      }

      const query = `INSERT INTO cart (userId, isbn, qty) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE qty = qty + 1`


      await db.query(query, [userId, isbn])
      req.session.flash = { text: 'Book added to cart.' }
      res.redirect(redirectUrl)
    } catch (error) {
      req.session.flash = { text: 'You need to log in to buy a book.' }
      res.redirect('../')
    }

  }

  /**
  * Returns a HTML form for the startpage of the bookstore.
  *
  * @param {object} req - Express request object.
  * @param {object} res - Express response object.
  */
  async checkOut(req, res) {
    const userId = req.session.userid

    const query = `SELECT c.isbn, b.title, b.author, b.price AS BookPrice, c.qty AS Quantity, (b.price * c.qty) AS TotalPricePerBook, (SELECT SUM(b2.price * c2.qty) FROM Cart c2 JOIN Books b2 ON c2.isbn = b2.isbn WHERE c2.userid = c.userid) AS Total FROM Cart c JOIN Books b ON c.isbn = b.isbn WHERE c.userid = ?`

    try {
      const [results] = await db.query(query, [userId])

      const viewData = {
        books: results
      }

      res.render('books/checkOut', { viewData })
    } catch (error) {
      req.session.flash = { text: 'Something went wrong, please try again.' }
      res.redirect('books/bookStore')
    }
  }

  async postCheckOut(req, res) {
    const userId = req.session.userid
    const adress = await this.getUserAddress(userId)

    const queryOrder = `INSERT INTO orders (userid, created, shipAddress, shipCity, shipZip) VALUES(?, CURDATE(), ?, ?, ?)`

    try {
      const [results] = await db.query(queryOrder, [userId, adress.address, adress.city, adress.zip])

      const orderId = results.insertId

      await db.query(
        `INSERT INTO odetails (ono, isbn, qty, amount) SELECT ?, c.isbn, c.qty, (c.qty * b.price) FROM Cart c JOIN Books b ON c.isbn = b.isbn WHERE c.userid = ?`, [orderId, userId])

      await db.query(`DELETE FROM Cart WHERE userid = ?`, [userId])

      const [orderDetails] = await db.query(`SELECT b.title, b.price, od.qty, od.amount, od.ono FROM odetails od JOIN Books b ON 
        od.isbn = b.isbn WHERE od.ono = ?`, [orderId])

      const totalAmount = orderDetails.reduce((total, item) => total + item.amount, 0)

      const viewData = {
        address: adress,
        orderDetails: orderDetails,
        totalAmount: totalAmount,
        orderId: orderId
      }

      res.render('books/invoice', { viewData })
    } catch (error) {
      req.session.flash = { text: 'You need to log in to buy a book.' }
      res.redirect('../')
    }
  }

  async getUserAddress(userId) {
    const query = `SELECT fname, lname, address, city, zip FROM Members WHERE userid = ?`
    try {
      const [results] = await db.query(query, [userId])

      return results[0]

    } catch (error) {
      req.session.flash = { text: 'Something went wrong, please try again.' }
    }
  }
}