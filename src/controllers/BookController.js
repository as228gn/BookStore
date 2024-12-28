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

      res.render('books/checkOut', {viewData})
  } catch (error) {
      console.error('Error updating cart:', error.message);
      res.status(500).render('error', { message: 'Ett fel uppstod när boken skulle läggas till i kundvagnen.' })
  }
    
    res.render('books/checkOut')
  }

  async postCheckOut(req, res) {
    const userId = req.session.userid
    const adress = await this.getUserAddress(userId)

    const query = `INSERT INTO orders (userid, created, shipAddress, shipCity, shipZip) VALUES(?, CURDATE(), ?, ?, ?)`
    
    try {
      const [results] = await db.query(query, [userId, adress.address, adress.city, adress.zip])

      res.render('books/bookStore')
  } catch (error) {
      console.error('Error updating cart:', error.message);
      res.status(500).render('error', { message: 'Ett fel uppstod när boken skulle läggas till i kundvagnen.' })
  }
//     START TRANSACTION;

// -- 1. Lägg till ny order
// INSERT INTO `Order` (user_id, received_date, shipment_date, shipping_address)
// SELECT 
//     ?, -- UserId
//     CURDATE(),
//     DATE_ADD(CURDATE(), INTERVAL 7 DAY),
//     address
// FROM 
//     Users
// WHERE 
//     user_id = ?;

// -- 2. Hämta det senaste order-id:t
// SET @last_order_id = LAST_INSERT_ID();

// -- 3. Lägg till böcker i `odetails`
// INSERT INTO odetails (order_id, isbn, quantity, amount)
// SELECT 
//     @last_order_id,
//     c.isbn, 
//     c.qty, 
//     (c.qty * b.price)
// FROM 
//     Cart c
// JOIN 
//     Books b ON c.isbn = b.isbn
// WHERE 
//     c.user_id = ?;

// -- 4. Töm kundvagnen
// DELETE FROM Cart WHERE user_id = ?;

// COMMIT;
  }

  async getUserAddress(userId) {
    const query = `SELECT fname, lname, address, city, zip FROM Members WHERE userid = ?`
    try {
        const [results] = await db.query(query, [userId])

        return results[0]
      
    } catch (error) {
        console.error('Error fetching user address:', error.message);
        throw error; // Skickar vidare felet
    }
}
}