require('dotenv').config();
var session = require('express-session'),
    bodyParser = require('body-parser'),
    csv = require("fast-csv-delims"),
    express = require('express'),
    multer  = require('multer'),
    QRCode = require('qrcode'),
    Jimp = require('jimp'),
    path = require('path'),
    url = require('url'),
    fs = require("fs"),
    app = express();

var connection = require('./utils/database');

app.set('views', 'views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: '2DEB-ILA4-JQPA0EJA',
    resave: true,
    saveUninitialized: true
}));
const urlencodedParser = bodyParser.urlencoded({extended: false});

var sql = `CREATE TABLE IF NOT EXISTS ${process.env.DB_TABLE_NAME} (
    Stamp text,
    Serial text,
    Production_date text,
    Objectt text,
    Coming_date text,
    Exit_date text,
    Sender text,
    Recipient text
) ENGINE=MYISAM `;
    connection.query(sql, function(err, results) {
    if(err) console.log(err);
    });

var sql2 = `CREATE TABLE IF NOT EXISTS db_info (
    id int,
    create_date timestamp,
    version varchar(255),
    major int,
    minor int,
    path int,
    PRIMARY KEY (id)
    );
`;
connection.query(sql2, function(err, results) {
    if(err) console.log(err);
    });
connection.query(`INSERT IGNORE INTO db_info (id, create_date) VALUES('1',Now())`);

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
            let brod = "";
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
                if (rows < 1) {tabl = ``;brod = `${code} <br>`; code = `Не найден`; };
                connection.query(`SELECT create_date FROM db_info`, function(err, rows, fields) {
                    let date = rows[0].create_date;

                    res.render("order_info", {
                        serial: code, 
                        database: tabl,
                        brode: brod,
                        dat: date.toLocaleString()
                    });
                });
            });
        });
    /*<---     /Order info     --->*/
    /*<---     Generate pages     --->*/
        app.get('/generate', function(req, res){
            res.render('generate');
        });
        app.get('/generate_single', urlencodedParser, function(req, res){
            res.render('generate_single');
        });
        app.get('/generate_array', urlencodedParser, function(req, res){
            res.render('generate_array');
        });
    /*<---     /Generate pages     --->*/
    /*<---     QRcodes     --->*/
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
    /*<---     /QRcodes     --->*/
    /*<---     Auth     --->*/
        var auth = function(req, res, next) {
    if (req.session && req.session.user === "admin" && req.session.admin)
      return next();
    else
      return res.sendStatus(401);
        };
        app.get('/login', function (req, res) {
    if(req.query.username === "admin" && req.query.password === `${process.env.admin_pass}`) {
        req.session.user = "admin";
        req.session.admin = true;

        res.render('auth_perm', {
            url: '/update',
            dat: 'Авторизация успешна'
        });
    } else {
        res.render('auth_perm', {
            url: '/auth',
            dat: 'Авторизация не успешна'
        });
    }
        });
        app.get('/auth', urlencodedParser, function(req, res){
    res.render('auth');
        });
    /*<---     /Auth     --->*/
    /*<---     Logout     --->*/
        app.get('/logout', function (req, res) {
    req.session.destroy();
    res.render('auth_perm', {
        url: '/',
        dat: 'Выход успешен'
    });
        });
    /*<---     /Logout     --->*/
    /*<---     Update_DB     --->*/
        app.get('/update', urlencodedParser, auth, function(req, res){
            res.render('update');
        });

        var storage = multer.diskStorage({
            destination: (req, file, cb) =>{
                cb(null, "uploads");
            },
            filename: (req, file, cb) =>{
                cb(null, 'Device_Moving_View.csv');
            }
        });
        const fileFilter = (req, file, cb) => {
            if((file.mimetype === "application/vnd.ms-excel") || (file.mimetype === "text/csv")){
                cb(null, true);
            }
            else{
                cb(null, false);
            }
        };
        var upload = multer({ storage: storage, fileFilter: fileFilter})
        app.post("/update/rest", upload.single('fef'), auth, function (req, res){
            let filedata = req.file;
            if(!filedata){
                res.render('auth_perm', {
                    url: '/update',
                    dat: 'Ошибка при загрузке файла'
                });
            }else{
                connection.query(`UPDATE db_info SET create_date=Now() WHERE id = '1'`);
                connection.query(`DELETE FROM ${process.env.DB_TABLE_NAME}`);
                csv_add();

                res.render('auth_perm', {
                    url: '/',
                    dat: 'Успешно выполнено'
                });
            }
        });
        app.post("/update/add", upload.single('fef'), auth, function (req, res){
            let filedata = req.file;
            if(!filedata) {
                res.render('auth_perm', {
                    url: '/update',
                    dat: 'Ошибка при загрузке файла'
                });
            }else{
                connection.query(`UPDATE db_info SET create_date=Now() WHERE id = '1'`);
                csv_add();

                res.render('auth_perm', {
                    url: '/',
                    dat: 'Успешно выполнено'
                });
            }
        });
    /*<---     /Update_DB     --->*/



/*<---   Site pages END   --->*/
app.listen(3000, function(){
    console.log('Server running');
});
// конец

function csv_add() {
    let csvData = [];
    var stream = fs.createReadStream("uploads/Device_Moving_View.csv");
        csv(stream, {delimiter: ';'})
            .validate(function(data){
                return !/[A-Za-zа-яА-Я]/g.test(data[1]);
            })
            .on("data-invalid", function(data){
                data.splice(1, 1, `${data[1].replace(/[^-.\d]/g, '')}`);
                csvData.push(data);
            })
            .on("data", function(data){
                csvData.push(data);
            })
            .on("end", function(){
                csvData.shift();
                let query =`INSERT INTO ${process.env.DB_TABLE_NAME} (Stamp, Serial, Production_date, Objectt, Coming_date, Exit_date, Sender, Recipient) VALUES ?`;
                connection.query(query, [csvData], (err, results) => {
                    console.log(err || results);
                });
            })
            .parse();
};