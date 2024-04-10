const express = require("express")    
const mysql = require('mysql2') 
const cors = require("cors")    

const app = express()
app.use(cors())

const db = mysql.createConnection({
    host: "localhost",
    user: 'root',
    password: '',
    port    :'4306',
    database: 'houses_data'
})

app.get('/', (re, res) => {
    return res.json ("From Backend  side")
})

app.get('/houses', (req, res) => {
    const sql = `
    SELECT p.*, pd.*
    FROM Properties p
    LEFT JOIN PropertyDetails pd ON p.PropertyID = pd.PropertyID;
  `;
    db.query(sql, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    })
})

app.listen(3000, () => {
    console.log("listening")
})