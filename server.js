const express = require('express');
const app = express();
const multer = require("multer");
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.enable('trust proxy');

// app.use(function(request, response, next) {

//      response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains'); 

//      next();
// });

// app.use((req, res, next) => {
//     if (req.header('x-forwarded-proto') !== 'https')
//       res.redirect(`https://${req.header('host')}${req.url}`);
//     else
//       next();
// });

const getPostgresClient = () => {
    const { Client } = require('pg');
    return new Client({
        connectionString: "postgres://hrdqkjutlzxtmz:ff4b0a7d5e00ee748c50a6ce93a662e9ea727d9f9abb11e13055b9a4c2a77ded@ec2-35-169-11-108.compute-1.amazonaws.com:5432/dc8f13lp2d9518",

        ssl: {
            rejectUnauthorized: false
        }
    });
}

app.get('/', function(req, res) {
    res.render('pages/video');
});

app.get('/admin', function(req, res) {
    res.render('pages/admin');
});

app.get('/treatments', function(req, res) {
    res.render('pages/treatments');
});

const upload = multer({ dest: "uploads/" });

const uploadFiles = (req, res) => {

    const fs = require('fs');
    
    const client = getPostgresClient();
    client.connect();

    fs.readFile(req.files[0].path, 'hex', function(err, imgData) {
        if (err) {
            console.log (err);
        }

        imgData = '\\x' + imgData;

        const uid_arr = req.files[0].path.split ("/");
        const uid = uid_arr[uid_arr.length - 1];
       
        console.log (req.body.device)

        client.query(`  INSERT INTO Selfies (id, dt, selfie, results, selfiesDim, score, device, uid) values 
                        (DEFAULT, NOW(), ($1), '${req.body.res}', '${req.body.dim}', '${req.body.score}', '${req.body.device}', '${uid}')`,
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
                                  res.send ("success");
                                client.end();
                            });
      });
}

app.post("/submit", upload.array("file"), uploadFiles);

app.get('/show_db', function(req, res, next) {

    const client = getPostgresClient();
    client.connect();

    client.query('SELECT id, dt, results, selfiesDim, score, device, comments, makes_sense, uid FROM Selfies ORDER BY dt DESC LIMIT 15',
                        function(err, readResult) {
                            if (err) {
                                console.log (err);
                            }
                            res.send(JSON.stringify(readResult));
                            client.end();
    });
});

app.get('/show_pic', async function(req, res, next) {

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

                const client = getPostgresClient();
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

const addInput = (req, res) => {

    const client = getPostgresClient();
    client.connect();

    console.log (req.body);

    console.log (`  UPDATE Selfies SET comments = '${req.body.comments}', makes_sense = ${req.body.makes_sense}
                    WHERE uid='${req.body.uid}'`);

    client.query(`  UPDATE Selfies SET comments = '${req.body.comments}', makes_sense = ${req.body.makes_sense}
                    WHERE uid='${req.body.uid}'`,
                        function(err) {
                            if (err) {
                                throw err;
                            }
                            
                            res.send ("success");
                            client.end();
                        });

}

app.post("/add_input", upload.array("file"), addInput);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});