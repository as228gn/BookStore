/**
 * @file Defines the book router.
 * @module bookRouter
 * @author Anna Ståhlberg
 */

import express from 'express'
import { BookController } from '../controllers/BookController.js'

export const router = express.Router()

const controller = new BookController()

router.get('/bookSearch', (req, res, next) => controller.bookSearch(req, res, next))
