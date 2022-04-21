const express = require('express')
const app = express()
const port = 3000
const dotenv = require('dotenv')

dotenv.config();

var cors = require('cors')
app.use(cors())

const connectDB = require('./config/db')
connectDB()

app.use(express.json()) 

app.get('/', (req, res) => res.send('Hello World!'))

app.use('/api/update', require('./routes/update'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})