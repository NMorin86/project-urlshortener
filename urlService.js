let dns = require('dns');
let mongoose = require('mongoose');

function makeNew(req, res, next) {
  console.log("In makenew: ", req.body.url);
  
  let URLtoShorten = req.body.url;
  shortenURL(URLtoShorten, (err, returnJSON) => {
    res.json(returnJSON);
    next();
  });
}

function shortenURL(newURL, done) {
  let returnJSON = {};
  
  dns.lookup(newURL, err => { 
    if(err !== 0) { // we have a problem
      return { error: 'Invalid URL. Error: ' + err };
    }
    
    URLModel.findOne({ url: newURL }).exec()
      .then(data => {
        if(data !== {}) { // we already have a record for this url
          returnJSON = { url: data.url, shortID: data.shortID };
          return Promise.reject("Duplicate");
        }
        
        return newShortID = URLModel.countDocuments({}).exec();
      })
      .then(count => {
        returnJSON = { url: newURL, shortID: count }
      })
      .catch(err => {
        if(err === "Duplicate") {
          done(null, returnJSON)
        } else {
          done(err, returnJSON)
        }
      });
        
          
    
  })
  
  return {url: newURL };   
}

function forward(req, res, next) {
  
  next();
}

let urlSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  shortID: Number });

let URLModel = mongoose.model("ShortURL", urlSchema);


module.exports.makeNew = makeNew;
module.exports.forward = forward;