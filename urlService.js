function makeNew(req, res, next) {
  console.log("In makenew: ", req.body.url);
  
  URLtoShorten = req.body.url;
  
  next();
}

function forward(req, res, next) {
  
  next();
}

module.exports.makeNew = makeNew;
module.exports.forward = forward;