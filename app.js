require('dotenv').config();
var bodyParser = require('body-parser'),
    express = require('express'),
    QRCode = require('qrcode'),
    Jimp = require('jimp'),
    path = require('path'),
    url = require('url'),
    app = express();
//я
var connection = require('./utils/database');
//у
app.set('views', 'views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
const urlencodedParser = bodyParser.urlencoded({extended: false});
//с
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
//т
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
                };
                let tabl = `
                                <thead>
                                    <tr>
                                        <td>#</td>
                                        <td>Марка</td>
                                        <td>Дата производства</td>
                                        <td>Объект</td>
                                        <td>Дата прихода</td>
                                        <td>Дата ухода</td>
                                        <td>Отправил</td>
                                        <td>Получил</td>
                                    </tr>
                                </thead>
                                <tbody>
                                ${str}
                                </tbody>
                            `
                if (rows < 1) {tabl = ``; code = 'Не найден'};
                res.render("order_info", {
                    serial: code, 
                    database: tabl
                });
            });
        });
    /*<---     /Order info     --->*/
app.get('/generate', function(req, res){
    res.render('generate');
});
app.get('/generate_single', urlencodedParser, function(req, res){
    res.render('generate_single');
});
app.get('/generate_array', urlencodedParser, function(req, res){
    res.render('generate_array');
});

app.post("/qrcode", urlencodedParser, function (req, res) {
    let code = `${req.body.lot}-${req.body.codee}-${req.body.num_code_lot}-${req.body.month}.${req.body.year}`;

    QRCode.toFile(
        `public/images/qrcodes/${code}.png`, 
        `http://${process.env.site}/order_info/?code=${code}`,
        {
            width: 236,
            margin: 1
        }
    );
    new Jimp(236, 295, '#FFF', async (err, image) => {
        const font = await  Jimp.loadFont('./utils/assets/font/qc.fnt');
        const qrcode_same = await  Jimp.read(`./public/images/qrcodes/${code}.png`);

        image.composite(qrcode_same, 0, 3);
        image.print(
            font,
            0,
            0,
            {
                text: `${code}`,
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM
            },
            236,
            275
        );

        const outputFile = `./public/images/qrcodes/${code}.png`;
        image.write(outputFile, function() {
            connection.query(`INSERT IGNORE INTO ${process.env.DB_TABLE_NAME} VALUES('', '${code}', '', '', '', '', '', '')`);

            res.render('qrcode', {
                qr_image: code
            });
        });
    });
});

app.post("/qrcode_list", urlencodedParser, function (req, res) {
    let code_min = `${req.body.lot}-${req.body.codee}-${req.body.min}-${req.body.month}.${req.body.year}`;
    let code_max = `${req.body.lot}-${req.body.codee}-${req.body.max}-${req.body.month}.${req.body.year}`;

    let cmin = parseInt(req.body.min);
    let cmax = parseInt(req.body.max);

    for (let i = cmin; i <= cmax; i++) {
        let code = `${req.body.lot}-${req.body.codee}-${i}-${req.body.month}.${req.body.year}`;
        connection.query(`INSERT IGNORE INTO ${process.env.DB_TABLE_NAME} VALUES('', '${code}', '', '', '', '', '', '')`);
//а
        QRCode.toFile(
            `public/images/qrcodes/${code}.png`, 
            `http://${process.env.site}/order_info/?code=${code}`,
            {
                width: 236,
                margin: 1
            }
        );
        new Jimp(236, 295, '#FFF', async (err, image) => {
            const font = await  Jimp.loadFont('./utils/assets/font/qc.fnt');
            const qrcode_same = await  Jimp.read(`./public/images/qrcodes/${code}.png`);
            image.composite(qrcode_same, 0, 3);
            image.print(
                font,
                0,
                0,
                {
                    text: `${code}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                    alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM
                },
                236,
                275
            );

            const outputFile = `./public/images/qrcodes/${code}.png`;
            image.write(outputFile);
        });
    }
//л
    function myFunc() {
        let max_count = cmax-cmin;

        new Jimp(2480, 3508, '#FFF', async (err, image) => {
            let i = 0;
            let left = 0;
            let down = 0;
            let codec = cmin;

            do {
                var code = `${req.body.lot}-${req.body.codee}-${codec}-${req.body.month}.${req.body.year}`;
                let qrcode_same = await Jimp.read(`./public/images/qrcodes/${code}.png`);
                image.composite(qrcode_same, (236*left)+50, (290*down)+10);
    
                left++;
                i++;
                codec++;
    
                if (i % 10 == 0) {
                    left = 0;
                    down++
                }
            } while (i <= max_count);
    
            let list = `${req.body.lot}-${req.body.codee}-${req.body.min}-${req.body.max}-${req.body.month}.${req.body.year}`;
            const outputFile = `./public/images/qrcodes/lists/${list}.png`;
            image.write(outputFile, function() {
                res.render('qrcode_list', {
                    code_min: code_min,
                    code_max: code_max,
                    list: list
                });
            });
        });
    }
    setTimeout(myFunc, 5000);
});

/*<---   Site pages END   --->*/
app.listen(3000, function(){
    console.log('Server running');
});
// жопа
