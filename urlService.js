let dns = require('dns');
let mongoose = require('mongoose');

function makeNew(req, res, next) {
  console.log("In makenew: ", req.body.url);
  
  let URLtoShorten = req.body.url;
  let returnJSON = shortenURL(URLtoShorten);
  res.json(returnJSON);
  next();
}

function shortenURL(newURL) {
  let returnJSON = {};
  
  dns.lookup(newURL, err => { 
    if(err !== 0) { // we have a problem
      return { error: 'Invalid URL. Error: ' + err };
    }
    
    if(URLModel.findOne({ url: newURL }).exec
    
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