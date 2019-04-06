let dns = require('dns').promises;
let mongoose = require('mongoose');

function makeNew(req, res, next) {
  console.log("###################\n# New url request: ", req.body.url);
  
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
  // Trim protocol and path, dns.lookup can't resolve it otherwise
  let trimmedURL = newURL.replace(/^https?:\/\//i, '').replace(/\/.*/, '')
  console.log("Trimmed url: ", trimmedURL);
  
  dns.lookup(trimmedURL)
    .then(() => {    
      // if lookup throws an error, catch it at the bottom
      // Check if we already have this URL saved
      console.log("Looking in DB for dupe, url: ", newURL);
      return URLModel.findOne({ url: newURL }).exec()
    })
    
    .then(maybeDuplicate => {
      console.log("testing dupe: ", maybeDuplicate);
      if(maybeDuplicate !== null) { 
        // We have this URL saved, so throw the existing doc to the error handler
        let repeat = { url: maybeDuplicate.url, shortID: maybeDuplicate.shortID };
        console.log("Found dupe, throwing: ", repeat);
        return Promise.reject({ duplicate: repeat });
        }
    
      // No duplicate, let's continue
      // shortID is just the next available number, starting at 0
      console.log("No dupes, counting documents");
      return URLModel.countDocuments({}).exec();
    })
      
    .then(count => {
      console.log("Creating new doc, count: ", count);
      // Time to make the document and save it to the DB
      let newShortURL = new URLModel({ url: newURL, shortID: count });
      return newShortURL.save()
    })
  
    .then(newShortURL => {
      console.log("Doc saved: ", newShortURL);
      // Callback with our URL and shortID.
      // TODO: rewrite as a Promise
      done(null, { url: newShortURL.url, shortID: newShortURL.shortID })
    })
  
    .catch(err => {
      console.log("Catching err: ", err);
      if(err.duplicate !== undefined) {
        // Return the dupe doc
        console.log("Returning duplicate doc: ", err.duplicate);
        done(null, err.duplicate)
      } else if(err.code === 'ENOTFOUND') {
        // dns.lookup failed to resolve url
        console.log("Lookup failed to resolve host")
        done(null, { error: "URL host not found" });
      } else {
        console.log("Throwing unspecificed error");
        done(err)
      }
    })
}

function forward(req, res, next) {
  console.log("###################\n# Forwarding shortURL: ", req.path);
  
  let shortIDstr = req.path.split('/')[3];
  let shortID;
  
  try {
    shortID = parseInt(shortIDstr, 10);
  } catch(err) {
    console.log("In catch block: " + err);
    res.send("Invalid shortID: " + shortIDstr);
    next();
    return;
  }
  
  console.log("ID resolved as int: ", shortID);
  getPath(shortID)
    .then(path => {
      console.log("Returned path: ", path);
      res.send("path: " + path);
    })

}

function getPath(shortID) {
  let URL = 
  URLModel.findOne({shortID: shortID}).exec()
    .then((doc) => {
      console.log("Doc found by shortID: ", doc);
      if(doc === null) {
        // Doc not found, throw some shit
        console.log("Doc doesn't exist, throwing");
        throw("ShortID not found")
      }
      // All good, return forwarding URL 
      console.log("Returning URL: ", doc.url);
      return doc.url;
    })
    // Junk in, error out
    .catch(err => { 
      console.log("In .catch block: ", err);
      return err + ": " + shortID;
    });
    
  
  return URL;
}
  

let urlSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  shortID: Number });

let URLModel = mongoose.model("ShortURL", urlSchema);


module.exports.makeNew = makeNew;
module.exports.forward = forward;