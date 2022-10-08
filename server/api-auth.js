var client = require("./index").client


const unauthEndpoints = [
  '/api',
  '/api/v1'
]

const adminEndpoints = [

]

const staffEndpoints = [

]

module.exports = async function (req, res, next) {
  if(unauthEndpoints.includes(req.path)) {
    next()
  }
  else if(req.headers.authorization == undefined) {
    res.status(401).send("Missing Authorization Header")
  }
  else {
    if(req.headers.authorization.split(" ")[0] != "User" || req.headers.authorization.split(" ")[0] != "Admin") {
      res.status(401).send("Malformed Authorization Header")
    }
    else {
      const idToken = req.headers.authorization.split(" ")[1]
      
      let authResult = await auth.verifyIDToken(idToken)

      if(authResult.status == "authenticated") {
        if(adminEndpoints.includes(req.path)) {
          const userDoc = (await db.collection("Users").doc(authResult.token.uid).get()).data()

          if(userDoc != undefined && userDoc.role == "admin") {
            req.user = authResult.token
            next()
          }
          else {
            res.status(403).send({error: "Forbidden", message: "administrator permissions required"})
          }
        } 
        else if(staffEndpoints.includes(req.path)) {
          const userDoc = (await db.collection("Users").doc(authResult.token.uid).get()).data()

          if(userDoc != undefined && (userDoc.role == "admin" || userDoc.role == "staff")) {
            req.user = authResult.token
            next()
          }
          else {
            res.status(403).send({error: "Forbidden", message: "staff permissions required"})
          }
        }
        else {
          req.user = authResult.token
          next()
        }
      }
      else {
        res.status(401).send({error: "Invalid ID Token", message: authResult.error.toString()})
      }
    }
  }
}