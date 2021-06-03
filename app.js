require('dotenv').config();
var bodyParser = require('body-parser');
var express = require('express');
var QRCode = require('qrcode');
var path = require('path');
var url = require('url');
var app = express();

var connection = require('./utils/database');

app.set('views', 'views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
const urlencodedParser = bodyParser.urlencoded({extended: false});


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

/*<---     Site pages     --->*/
    /*<---     Index     --->*/
        app.get('/', function(req, res){
            res.render('index');
        });
    /*<---     /Index     --->*/
    /*<---     Order info     --->*/
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
                res.render("order_info", {
                    serial: code, 
                    database: str
                });
            });
        });
    /*<---     /Order info     --->*/


app.get('/testpage', urlencodedParser, function(req, res){
    res.render('testpage');
});

app.get('/generate', urlencodedParser, function(req, res){
    res.render('generate', {
        opt_code: [123, 12]
    });
});

app.post("/qrcode", urlencodedParser, function (req, res) {
    let code = `${req.body.lot}-${req.body.codee}-${req.body.num_code_lot}-${req.body.month}.${req.body.year}`;
    QRCode.toFile(`public/images/qrcodes/${code}.png`, `http://${process.env.site}/order_info/?code=${code}`);

    connection.query(`INSERT IGNORE INTO ${process.env.DB_TABLE_NAME} VALUES('', '${code}', '', '', '', '', '', '')`);

    res.render('qrcode', {
        qr_image: code
    });
});
// жопа



/*<---   Site pages END   --->*/
app.listen(3000, function(){
    console.log('Server running');
});