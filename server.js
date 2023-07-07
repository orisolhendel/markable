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
    console.log(req.body);
    console.log ("=================================");
    console.log(req.files);
    res.json({ message: "Successfully uploaded files" });
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});