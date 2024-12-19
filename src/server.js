/**
 * @file The starting point of the application.
 * @module src/server
 * @author Anna Ståhlberg
 * @version 1.0.0
 */

import express from 'express'
import expressLayouts from 'express-ejs-layouts'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { router } from './routes/router.js'
import db from './config/db.js';


// Get the path of the current module's directory.
const directoryFullName = dirname(fileURLToPath(import.meta.url))

// Set the base URL to use for all relative URLs in a document.
const baseURL = process.env.BASE_URL || '/'

// Create Express application.
const app = express()

// View engine setup.
app.set('view engine', 'ejs')
app.set('views', join(directoryFullName, 'views'))
app.set('layout', join(directoryFullName, 'views', 'layouts', 'default'))
app.set('layout extractScripts', true)
app.set('layout extractStyles', true)
app.use(expressLayouts)

// Parse requests of the content type application/x-www-form-urlencoded.
// Populates the request object with a body object (req.body).
app.use(express.urlencoded({ extended: false }))

// Serve static files.
app.use(express.static(join(directoryFullName, '..', 'public')))

// Middleware to be executed before the routes.
app.use((req, res, next) => {
  // Pass the base URL to the views.
  res.locals.baseURL = baseURL

  next()
})

// Register routes.
app.use('/', router)

// Error handler.
app.use((err, req, res, next) => {
  console.error(err)

  if (err.status === 403) {
    res
      .status(403)
      .sendFile(join(directoryFullName, 'views', 'errors', '403.html'))
    return
  }

  if (err.status === 404) {
    res
      .status(404)
      .sendFile(join(directoryFullName, 'views', 'errors', '404.html'))
    return
  }

  res
    .status(500)
    .sendFile(join(directoryFullName, 'views', 'errors', '500.html'))
})

// Hantera databasanslutningen
db.getConnection()
  .then(() => console.log('Database connected successfully!'))
  .catch((err) => {
    console.error('Database connection failed: ', err)
    process.exit(1)
  })

// Starts the HTTP server listening for connections.
const server = app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${server.address().port}`)
  console.log('Press Ctrl-C to terminate...')
})
