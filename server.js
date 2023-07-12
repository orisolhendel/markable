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
    // console.log(req.body);
    // console.log ("=================================");
    // console.log(req.files);
    // console.log ("=================================");

    //const MongoClient = require('mongodb').MongoClient;
    //const url = "mongodb+srv://orisolhendel:UJAy4xH95Gy5F6iR@cluster0.r22vgmy.mongodb.net/?retryWrites=true&w=majority";
    
    // MongoClient.connect(url, function(err, db) {
    //     if (err) {
    //         throw err;
    //     }
    //     var dbo = db.db("markable");
    //     console.log (dbo);
    //     const myobj = { time: new Date (Date.now()), file: req.files[0], result: req.body.res };
    //     console.log (myobj);
    //     dbo.collection("selfies").insertOne(myobj, function(err, res) {
    //         if (err) {
    //             throw err;
    //         }
    //         console.log(res);
    //         console.log("1 document inserted");
    //         db.close();
    //     });
    // });

    //res.json({ message: "Successfully uploaded files" });

    const { Client } = require('pg');
    const fs = require('fs');

    const client = new Client({
        connectionString: "postgres://hrdqkjutlzxtmz:ff4b0a7d5e00ee748c50a6ce93a662e9ea727d9f9abb11e13055b9a4c2a77ded@ec2-35-169-11-108.compute-1.amazonaws.com:5432/dc8f13lp2d9518",

        ssl: {
            rejectUnauthorized: false
        }
    });

    client.connect();

    //let buf = Buffer.from(req.files[0],'binary');

    console.log (req.files[0]);
    console.log ("========");
    console.log (req.files[0].toString());
    console.log ("========");
    //console.log (`INSERT INTO Selfies (id, dt, selfie, results) values (1, NOW(), '${req.files[0].toString()}', '${req.body.res}')`);



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


    // client.query(`INSERT INTO Selfies (id, dt, selfie, results) values (1, NOW(), '${req.files[0].toString()}', '${req.body.res}')`, (err, res) => {
    //     if (err) throw err;
    //     console.log (res);
    //     client.end();
    // });
}

// app.get('/show_db', function(req, res) {
//     const client = new MongoClient(url, { useUnifiedTopology: true });
//     client.connect(function(err) {
//         console.log("Connected to server.");
//         const db = client.db(dbName);
//         db.collection("books")
//             .find({})
//             .toArray(function(err, result) { 
//                 if (err) throw err; 
//                 client.close();
//                 console.log("Done reading db.");
//                 res.send(JSON.stringify(result));
//         });
//     });
// });

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

    client.query('SELECT * FROM Selfies ORDER BY dt DESC limit 1',
                        function(err, readResult) {
                            console.log (__dirname)
                            console.log (__dirname + '/tmp/foo.jpg')
                            console.log ("========================");
                            console.log('err',err,'pg readResult',readResult);
                            console.log ("========================");
                            fs.writeFile(__dirname + '/tmp/foo.jpg', readResult.rows[0].selfie, err => console.log (err));
                            //res.status(200).json(obj)
                            client.end();
    });
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});