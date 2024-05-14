require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();
const MongoClient = require('mongodb').MongoClient;


const connection = new MongoClient("mongodb://localhost:27017/");
const db = connection.db("url_shortener");
const urls = db.collection("urls");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', async function(req, res) {
  try {
    let url = new URL(req.body.url);
    
    let search = await urls.findOne({original_url: url.href});
    if (search) {
      return res.json({original_url: search.original_url, short_url: search.short_url}); 
    }

    let dbcount = await urls.countDocuments();
    let newUrl = {original_url: url.href, short_url: dbcount};
    let results = await urls.insertOne(newUrl);

    if(!results) throw "Insert Failed";
    return res.json({original_url: newUrl.original_url, short_url: newUrl.short_url});
     
  } catch(e) {
    return res.json({error: "invalid url"})
  }
});
app.get('/api/shorturl/:shorturl', async function(req, res) {
  console.log(req.params.shorturl)


  let urlObj = await urls.findOne({short_url: parseInt(req.params.shorturl)});
  console.log(urlObj);
  return res.redirect(urlObj.original_url);
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
