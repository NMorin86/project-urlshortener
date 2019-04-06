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
    
  dns.lookup(newURL, err => { 
    if(err !== 0) { // we have a problem
      done(0, { error: 'Invalid URL. Error: ' + err });
    } else {    
      URLModel.findOne({ url: newURL }).exec()
        .then(maybeDuplicate => {
          if(maybeDuplicate !== {}) { // we already have a record for this url
            let repeat = { url: maybeDuplicate.url, shortID: maybeDuplicate.shortID };
            return Promise.reject({ duplicate: repeat });
          }
        })
        .then(() => {        
          return URLModel.countDocuments({}).exec();
        })
        .then(count => {
          returnJSON = { url: newURL, shortID: count }
        })
        .catch(err => {
          if(err.duplicate !== {}) {
            done(null, err.duplicate)
          } else {
            done(err)
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