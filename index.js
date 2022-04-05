
var config = require('dotenv').config()
global.config = config.parsed

var express = require("express")
var app = require('express')();
var server = require('http').Server(app);
var bodyParser = require("body-parser")

app.use(bodyParser.json());

var conn_obj = {
  host: process.env.mysql_host,
  port: process.env.mysql_port,
  user: process.env.mysql_user,
  password: process.env.mysql_password,
  database: process.env.mysql_database,
  supportBigNumbers: true,
  bigNumberStrings: true,
  typeCast: function (field, next) {
    //console.log(field.table, field.name, field.type)
    if (field.type == "NEWDECIMAL") {
      //console.log("field", field)
      var value = field.string();
      return (value === null) ? null : Number(value);
    }
    return next();
  }

}

var knex = require('knex')({
  client: 'mysql2',
  connection: conn_obj,

  pool: { min: 0, max: 7 }
});
global.knex = knex

server.listen(process.env.service_port)
console.log("Server listening on port", process.env.service_port)


app.post('/get_sql', async function (req, res) {
  console.log("get_sql", req.body)
  try {
    var result = await knex.raw(req.body.query)
    res.send({ stat: true, rows: result[0] })
    console.log("result length", result[0].length)
  } catch (error) {
    console.log(error)
    res.send({ stat: false, error: error })
  }

})


