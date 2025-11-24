const bcrypt = require('bcrypt');

const saltRounds= 10;

const hashPassword = async(password)=>{
    return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async(plain , hashed)=>{
    return await bcrypt.compare(plain, hashed);
};

module.exports= {hashPassword,comparePassword};
