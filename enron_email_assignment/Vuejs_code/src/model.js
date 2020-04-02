const fs = require('fs')
const path = require('path')
const sqlite3 = require('sqlite3')
const dbFile = path.join(__dirname, 'db', 'enron.sql')
var dbExists = fs.existsSync(dbFile)

if (!dbExists) {
  fs.openSync(dbFile, 'w');
}

const db = new sqlite3.Database(dbFile, err => {
    if (err) {
        return console.error(err.message);
    }
    console.log("Connected to the in-memory SQlite database.");
})

const dataSql = fs.readFileSync(path.join(__dirname, 'db', 'enron.sql'), 'utf8').toString()
const dataArr = dataSql.toString().split(');')
db.serialize(() => {
  dataArr.forEach((query) => {
    if (query) {
      query += ');'
      db.run(query, (err) => {
        if (err) {
            console.log('.')
        }
      })
    }
  })
})

const getData = function (query, callback) {
    db.all(query, callback)
}

export default {
    getData
}