/**
 * @file Defines the account router.
 * @module accountRouter
 * @author Anna Ståhlberg
 */

import express from 'express'
import { AccountController } from '../controllers/AccountController.js'

export const router = express.Router()

const controller = new AccountController()

router.get('/register', (req, res, next) => controller.register(req, res, next))
router.post('/register', (req, res, next) => controller.postRegister(req, res, next))

router.get('/login', (req, res, next) => controller.login(req, res, next))
router.post('/login', (req, res, next) => controller.postLogin(req, res, next))

router.post('/logout', (req, res, next) => controller.logOut(req, res, next))