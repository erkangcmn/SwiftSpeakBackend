const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.headers['x-access-token']
    if (token) {
        jwt.verify(token, req.app.get('api_secret_key'), (err, decoded)=>{
            if(err){
                res.json({
                    status:false,
                    message:"Token Geçersiz!"
                })
            }else{
                const decode = decoded
                next()
            }
        })
    } else {
        res.json({
            status:false,
            message:"Token bulunamadı!"
        })
    }
}