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
//router.post('/subject', (req, res, next) => controller.postSearchBySubject(req, res, next))
