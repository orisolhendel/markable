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
        if (err) console.log (err);
        imgData = '\\x' + imgData;
        client.query(`INSERT INTO Selfies (id, dt, selfie, results, selfiesDim) values (DEFAULT, NOW(), ($1), '${req.body.res}', '${req.body.dim}')`,
                           [imgData],
                           function(err) {
                                if (err) throw err;
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

    client.query('SELECT id, dt, results, selfiesDim FROM Selfies ORDER BY dt DESC',
                        function(err, readResult) {
                            if (err) console.log (err);
                            res.send(JSON.stringify(readResult));
                            client.end();
    });
});



app.get('/show_pic', async function(req, res, next) {

    const { Client } = require('pg');
    const fs = require('fs');

    // before goint to the db - see if our file is already in place:

    
    fs.readdir(__dirname + '/public/tmp', function (err, files) {
        
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        
        for(let index = 0; index < files.length; index++){

            const file = files [index];
            // TODO: use guid and not datatime for picture format
            if (file.startsWith (`${req.query.id}_`)) {
                console.log ("file already in dir");
                res.send (file); 
                break;
            } else if (index === files.length - 1) { // not found - take from db

                console.log ("fetching from database");

                const client = new Client({
                    connectionString: "postgres://hrdqkjutlzxtmz:ff4b0a7d5e00ee748c50a6ce93a662e9ea727d9f9abb11e13055b9a4c2a77ded@ec2-35-169-11-108.compute-1.amazonaws.com:5432/dc8f13lp2d9518",
            
                    ssl: {
                        rejectUnauthorized: false
                    }
                });
            
                client.connect();
            
                client.query(`SELECT selfie, dt, selfiesDim FROM Selfies WHERE id = ${req.query.id} `,
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
            } 
        };
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});