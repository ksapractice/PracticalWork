const http = require('http');
const url = require('url');
const stl = require('./pages/style');                                                       // css style for page
const connection = require('./module/database');                                            // module mysql2 connection

http.createServer((request, response) => {
    let urlRequest = url.parse(request.url, true);                                          // get request url
    let code = String(urlRequest.path.slice(1));                                            // getting the request code
    var queue = `SELECT * FROM devicemovingview where Serial = '${code}'`;
    if (request.method == 'GET') {
        response.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
        response.write(`
            <!DOCTYPE html>
                <head><title>${code}</title></head> 
                <body> <style>${stl}</style>
                    <div class="container">
                        <h1>Серийный номер: ${code}</h1>
                        <table class="content-table">
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
        `);
        var str = "";
        connection.query(queue, function(err, rows, fields) {
            if (err) throw err;
            if (rows < 1) response.write(`<tr><td colspan="8" align="center">NOT FOUND</td></tr>`); //if empty data
            for (var i in rows) {
                str =   `<tr>
                            <td>${parseInt(i)+1}</td>
                            <td>${rows[i].Stamp}</td> 
                            <td>${rows[i].Production_date}</td>
                            <td>${rows[i].Object}</td>
                            <td>${rows[i].Coming_date}</td>
                            <td>${rows[i].Exit_date}</td>
                            <td>${rows[i].Sender}</td>
                            <td>${rows[i].Recipient}</td>
                        </tr>`
                response.write(str);
            };
            response.end(`
                            </tbody>
                        </table>
                    </div>
                </body>
            </html>
            `);
        });
    };
}).listen(3000); // http://localhost:3000/