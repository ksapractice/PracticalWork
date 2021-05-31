require('dotenv').config();
var express = require('express');
var ontime = require('ontime');
var QRCode = require('qrcode');
var path = require('path');
var url = require('url');
var fs = require('fs');
var app = express();

var connection = require('./utils/database');

var datecode = require('./utils/data_code.json');
var now = new Date();

app.set('views', 'views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));



const sql = `CREATE TABLE IF NOT EXISTS devicemovingview (
    Stamp text,
    Serial text,
    Production_date text,
    Objectt text,
    Coming_date text,
    Exit_date text,
    Sender text,
    Recipient text
  )`;
connection.query(sql, function(err, results) {
    if(err) console.log(err);
});

/*<---   Daily event        --->*/
ontime({
    cycle: '23:59:59'
}, function (ot) {
    datecode.year = now.getFullYear();
    datecode.month = now.getMonth();
    datecode.day = now.getDate();
    datecode.num = 0;
	fs.writeFile('./utils/data_code.json', JSON.stringify(datecode, null, '\t'), (err)=>{if(err) console.log(err)});

    ot.done()
    return
});
/*<---   Daily event END    --->*/
/*<---   Site pages         --->*/
app.get('/', function(req, res){
    res.render('index');
});
app.get('/order_info/*', function(req, res){
    let urlRequest = url.parse(req.url, true);
    let code = String(urlRequest.query.code);
    var queue = `SELECT * FROM ${process.env.DB_TABLE_NAME} where Serial = '${code}'`;  

    connection.query(queue, function(err, rows, fields) {
        let str = '';
        for (var i in rows) {
            str += `<tr>
                <td>${parseInt(i)+1}</td>
                <td>${rows[i].Stamp}</td> 
                <td>${rows[i].Production_date}</td>
                <td>${rows[i].Objectt}</td>
                <td>${rows[i].Coming_date}</td>
                <td>${rows[i].Exit_date}</td>
                <td>${rows[i].Sender}</td>
                <td>${rows[i].Recipient}</td>
            </tr>`;
        }
        if (rows < 1) {str = `<tr><td colspan="8" align="center">NOT FOUND</td></tr>`; code = 'NOT FOUND'};
        res.render("order_info", {serial: code, database: str});
    });
});
app.get('/qrcode', function(req, res){
	datecode.num ++;
	fs.writeFile('./utils/data_code.json', JSON.stringify(datecode, null, '\t'), (err)=>{if(err) console.log(err)});

    let code = `${datecode.year}-${datecode.month}-${datecode.day}-${datecode.num}`;
    QRCode.toFile(`public/images/qrcodes/${code}.png`, `http://${process.env.site}/order_info/?code=${code}`)

    connection.query(`INSERT IGNORE INTO ${process.env.DB_TABLE_NAME} VALUES('', '${code}', '', '', '', '', '', '')`);

    res.render('qrcode', {qr_image: `${code}`});
});

app.get('/testpage', function(req, res){
    res.render('testpage');
});
/*<---   Site pages END   --->*/
app.listen(3000, function(){
    console.log('Server running');
});