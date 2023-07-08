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

    const MongoClient = require('mongodb').MongoClient;
    const url = "mongodb+srv://orisolhendel:UJAy4xH95Gy5F6iR@cluster0.r22vgmy.mongodb.net/?retryWrites=true&w=majority";
    
    MongoClient.connect(url, function(err, db) {
        if (err) {
            throw err;
        }
        var dbo = db.db("markable");
        console.log (dbo);
        const myobj = { time: new Date (Date.now()), file: req.files[0], result: req.body.res };
        console.log (myobj);
        dbo.collection("selfies").insertOne(myobj, function(err, res) {
            if (err) {
                throw err;
            }
            console.log(res);
            console.log("1 document inserted");
            db.close();
        });
    });

    res.json({ message: "Successfully uploaded files" });
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});