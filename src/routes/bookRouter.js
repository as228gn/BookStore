/**
 * @file Defines the book router.
 * @module bookRouter
 * @author Anna Ståhlberg
 */

import express from 'express'
import { BookController } from '../controllers/BookController.js'

export const router = express.Router()

const controller = new BookController()

router.get('/bookStore', (req, res, next) => controller.bookStart(req, res, next))

router.get('/subject/:id', (req, res, next) => controller.getBooksBySubject(req, res, next))
router.get('/subject/:id/:page', (req, res, next) => controller.getBooksBySubject(req, res, next))
router.get('/subject', (req, res, next) => controller.getSubjects(req, res, next))

router.post('/cart', (req, res, next) => controller.addToCart(req, res, next))

router.get('/checkOut', (req, res, next) => controller.checkOut(req, res, next))
router.post('/checkOut', (req, res, next) => controller.postCheckOut(req, res, next))

router.get('/authorTitle', (req, res, next) => controller.getAuthorTitlePage(req, res, next))

router.get('/search', (req, res, next) => controller.getBooksBySearch(req, res, next))

 