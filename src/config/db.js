


// Importera dotenv och mysql2 med ESM-syntax
import dotenv from 'dotenv'
import mysql from 'mysql2'

// Ladda miljövariabler från .env-filen
dotenv.config()

// Skapa en pool för MySQL-anslutning
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})

// Exportera poolens promise-baserade API med ESM-syntax
export default pool.promise()