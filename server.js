const express = require('express');
const app = express();
const multer = require("multer");
const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.render('pages/video');
});

app.get('/admin', function(req, res) {
    res.render('pages/admin');
});

const upload = multer({ dest: "uploads/" });

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
        if (err) {
            console.log (err);
        }

        imgData = '\\x' + imgData;

        const uid_arr = req.files[0].path.split ("/");
        const uid = uid_arr[uid_arr.length - 1];
        console.log (uid_arr);
        console.log (uid);

        client.query(`  INSERT INTO Selfies (id, dt, selfie, results, selfiesDim, score, uid) values 
                        (DEFAULT, NOW(), ($1), '${req.body.res}', '${req.body.dim}', '${req.body.score}', '${uid}')`,
                           [imgData],
                           function(err) {
                                if (err) {
                                    throw err;
                                }

                                fs.rename (req.files[0].path, `${__dirname}/public/tmp/${uid}.jpg`,  err => {
                                    if (err) {
                                        throw err
                                    }
                                    console.log(`moving: ${req.files[0].path} => ${__dirname}/public/tmp/${uid}.jpg`)
                                  })
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

    client.query('SELECT id, dt, results, selfiesDim, score, uid FROM Selfies ORDER BY dt DESC LIMIT 15',
                        function(err, readResult) {
                            if (err) {
                                console.log (err);
                            }
                            res.send(JSON.stringify(readResult));
                            client.end();
    });
});



app.get('/show_pic', async function(req, res, next) {

    const { Client } = require('pg');
    const fs = require('fs');

    // before going to the db - see if our file is already in place:

    fs.readdir(__dirname + '/public/tmp', function (err, files) {
        
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        
        for(let index = 0; index < files.length; index++){

            const file = files [index];
            // TODO: use guid and not datatime for picture format. the guid can come from the auto-generated upload above
            if (file.startsWith (req.query.uid)) {
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
            
                client.query(`SELECT selfie, dt, selfiesDim FROM Selfies WHERE uid = '${req.query.uid}' `,
                                    function(err, readResult) {
                                        if (err) {
                                            console.log (err);
                                        }
            
                                        let imgName = "";
                                        try {
                                            imgName = req.query.uid;
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