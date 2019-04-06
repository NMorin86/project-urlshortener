let dns = require('dns');
let mongoose = require('mongoose');

function makeNew(req, res, next) {
  console.log("In makenew: ", req.body.url);
  
  let URLtoShorten = req.body.url;
  shortenURL(URLtoShorten, (err, returnJSON) => {
    if(err === 0) {
      res.json(returnJSON);
    } else {
      res.json({error: err})
    }
    next();
  });
}

function shortenURL(newURL, done) {
console.log("In shorten: ", newURL);    
  dns.lookup(newURL, err => { 
console.log("In DNS.lookup, err: ", err);
    if(err !== 0) { // we have a problem
      done(0, { error: 'Invalid URL. Error: ' + err });
    } else {    
console.log("Lookingin DB for duplicate, url: ", newURL);
      URLModel.findOne({ url: newURL }).exec()
        .then(maybeDuplicate => {
          if(maybeDuplicate !== {}) { // we already have a record for this url
            let repeat = { url: maybeDuplicate.url, shortID: maybeDuplicate.shortID };
console.log("Found duplicate, throwing, repeat: ", repeat);
            return Promise.reject({ duplicate: repeat });
          }
        })
        .then(() => {        
console.log("No dupes, counting documents");
        return URLModel.countDocuments({}).exec();
        })
        .then(count => {
console.log("Count complete, creating new doc, count: ", count);
        let newShortURL = new URLModel({ url: newURL, shortID: count });
          return newShortURL.save()
        })
        .then(newShortURL => {
console.log("Doc saved, doc: ", newShortURL);
        done(null, { url: newShortURL.url, shortID: newShortURL.shortID })
        })
        .catch(err => {
console.log("Catching err, err: ", err);
        if(err.duplicate !== {}) {
console.log("Returning duplicate doc, doc: ", err.duplicate);
          done(null, err.duplicate)
          } else {
console.log("Throwing unspecificed error");
            done(err)
          }
        })
    }
  });
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