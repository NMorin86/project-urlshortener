function makeNew(req, res, next) {
  console.log("In makenew: ", req.body.url);
  
  let URLtoShorten = req.body.url;
  let returnJSON = shortenURL(URLtoShorten);
  res.json(returnJSON);
  next();
}

let dns = require('dns');

function shortenURL(newURL) {
  let err = dns.lookup(newURL, err => err) === 0)) { // we have a problem
    return { error: 'Invalid URL. err: ' + err };
  
  return {url: newURL };   
}

function forward(req, res, next) {
  
  next();
}

module.exports.makeNew = makeNew;
module.exports.forward = forward;