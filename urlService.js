let dns = require('dns').promises;
let mongoose = require('mongoose');

function makeNew(req, res, next) {
  console.log("In makenew: ", req.body.url);
  
  let URLtoShorten = req.body.url;
  shortenURL(URLtoShorten, (err, returnJSON) => {
    if(err === null) {
      res.json(returnJSON);
    } else {
      res.json({error: err})
    }
    next();
  });
}

function shortenURL(newURL, done) {
  console.log("In shorten: ", newURL);    
  dns.lookup(newURL)
    .then(() => {    
      // 
      console.log("Lookingin DB for dupe, url: ", newURL);
      return URLModel.findOne({ url: newURL }).exec()
    })
    .then(maybeDuplicate => {
      // URL is good, check if we already have this URL saved
      console.log("testing dupe: ", maybeDuplicate);
      if(maybeDuplicate !== null) { // we already have a record for this url
        let repeat = { url: maybeDuplicate.url, shortID: maybeDuplicate.shortID };
                      console.log("Found dupe, throwing: ", repeat);
        return Promise.reject({ duplicate: repeat });
        }
      })
  
    .then(() => {        
                      console.log("No dupes, counting documents");
        return URLModel.countDocuments({}).exec();
        })
        .then(count => {
                      console.log("Creating new doc, count: ", count);
        let newShortURL = new URLModel({ url: newURL, shortID: count });
          return newShortURL.save()
        })
        .then(newShortURL => {
                      console.log("Doc saved: ", newShortURL);
        done(null, { url: newShortURL.url, shortID: newShortURL.shortID })
        })
        .catch(err => {
                      console.log("Catching err: ", err);
        if(err.duplicate !== {}) {
                      console.log("Returning duplicate doc: ", err.duplicate);
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