var mysql = require('mysql');
var client = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '' ,
  database: 'click'
});
module.exports=client;

