var express = require('express');
var router = express.Router();
const url = require('url');
const connection = require('../utils/database'); 

/* GET home page. */
router.get('/order_info', function(req, res){
  let urlRequest = url.parse(req.url, true);
  let code = String(urlRequest.path.slice(12));
  var queue = `SELECT * FROM devicemovingview where Serial = '${code}'`;  

  connection.query(queue, function(err, rows, fields) {
      let str = '';
      for (var i in rows) {
          str += `<tr>
              <td>${parseInt(i)+1}</td>
              <td>${rows[i].Stamp}</td> 
              <td>${rows[i].Production_date}</td>
              <td>${rows[i].Object}</td>
              <td>${rows[i].Coming_date}</td>
              <td>${rows[i].Exit_date}</td>
              <td>${rows[i].Sender}</td>
              <td>${rows[i].Recipient}</td>
          </tr>`;
      }
      if (rows < 1) str = `<tr><td colspan="8" align="center">NOT FOUND</td></tr>`; //if empty data
      res.render("order_info", {serial_id: code, serial: code, database: str});
  });
});

module.exports = router;
