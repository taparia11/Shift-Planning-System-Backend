const connectToMongo = require('./db');
const express = require('express')
var cors = require('cors')

connectToMongo();
const app = express()
const port = 5000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('🥳 Shift Planning system Backend Working')
})

// Available routes 
app.use('/api/auth', require('./routes/auth'))
app.use('/api/employee', require('./routes/employee'))
app.use('/api/admin', require('./routes/admin'))

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})