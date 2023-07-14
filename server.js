const express = require('express');
const app = express();
const multer = require("multer");
const port = process.env.PORT || 3000;


const upload = multer({ dest: "uploads/" });

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/video.html');
});

app.post("/submit", upload.array("file"), uploadFiles);

function uploadFiles(req, res) {
    

    const { Client } = require('pg');
    const fs = require('fs');

    const client = new Client({
        connectionString: "postgres://hrdqkjutlzxtmz:ff4b0a7d5e00ee748c50a6ce93a662e9ea727d9f9abb11e13055b9a4c2a77ded@ec2-35-169-11-108.compute-1.amazonaws.com:5432/dc8f13lp2d9518",

        ssl: {
            rejectUnauthorized: false
        }
    });

    client.connect();

    fs.readFile(req.files[0].path, 'hex', function(err, imgData) {
        console.log('imgData',imgData);
        imgData = '\\x' + imgData;
        client.query(`INSERT INTO Selfies (id, dt, selfie, results) values (DEFAULT, NOW(), ($1), '${req.body.res}')`,
                           [imgData],
                           function(err) {
                                if (err) throw err;
                                console.log (res);
                                client.end();
        });
      });
}

app.get('/show_db', function(req, res, next) {

    const { Client } = require('pg');
    const fs = require('fs');

    const client = new Client({
        connectionString: "postgres://hrdqkjutlzxtmz:ff4b0a7d5e00ee748c50a6ce93a662e9ea727d9f9abb11e13055b9a4c2a77ded@ec2-35-169-11-108.compute-1.amazonaws.com:5432/dc8f13lp2d9518",

        ssl: {
            rejectUnauthorized: false
        }
    });

    client.connect();

    client.query('SELECT id, dt, results FROM Selfies ORDER BY dt DESC',
                        function(err, readResult) {
                            if (err) console.log (err);
                            res.send(JSON.stringify(readResult));
                            client.end();
    });
});


app.get('/show_pic', function(req, res, next) {

    const { Client } = require('pg');
    const fs = require('fs');

    const client = new Client({
        connectionString: "postgres://hrdqkjutlzxtmz:ff4b0a7d5e00ee748c50a6ce93a662e9ea727d9f9abb11e13055b9a4c2a77ded@ec2-35-169-11-108.compute-1.amazonaws.com:5432/dc8f13lp2d9518",

        ssl: {
            rejectUnauthorized: false
        }
    });

    client.connect();

    client.query(`SELECT selfie, dt FROM Selfies WHERE id = ${req.query.id} `,
                        function(err, readResult) {
                            if (err) console.log (err);

                            let imgName = "";
                            try {
                                imgName = req.query.id + "_" + readResult.rows[0].dt;
                            } catch (e) {
                                console.log (e);
                            }

                            let path = "";
                            try {
                                path = __dirname + `/public/tmp/${imgName}.jpg`;
                            } catch (e) {
                                console.log (e);
                            }

                            fs.writeFile(path, readResult.rows[0].selfie, { overwrite: false },err => {if (err) {console.log (err)}});
                            
                            res.send(`${imgName}.jpg`);
                            client.end();
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});