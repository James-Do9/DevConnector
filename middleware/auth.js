const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next){
    const token = req.header("x-auth-token");//Grabs token from header
    if(!token){//Checks if not token
        return res.status(401).json({msg: "No token, authorization denied"});
    }

    try{//Verify token
        const decoded = jwt.verify(token, config.get("jwtSecret"));
        req.user = decoded.user;
        next();
    }catch(err){
        res.status(401).json({ msg: "Token is not valid"});
    }
}