const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const { hashPassword, comparePassword } = require("../utils/hashPassword");
const { hash } = require("bcrypt");

const JWT_SECRET = process.env.JWT_SECRET;

class AuthService {
  static async register({ firstName, lastName, email, password }) {
    //check for existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw { status: 409, message: "User with this email already exist!!" };
    }
    //hash password
    const hashedPassword = await hashPassword(password);

    const user= await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
        },
        select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
        },
    });
    return user;

  }
static async login({email,password}){
    //search for user
    const user= await prisma.user.findUnique({where: {email}});
    if(!user){
        throw{ status: 404, message: "User with this email does not exist!!"};
    }
    const isValid= await comparePassword(password, user.password);
    if(!isValid){
        throw{ status:400, message: "Invalid password!!"};
    }
    const token= jwt.sign(
        {userId:user.id,email:user.email},
        JWT_SECRET,
        {expiresIn:'12h'}   
    );
    return {
        token,
        user: {
            id:user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        }
    }
}


}

module.exports= {AuthService};
