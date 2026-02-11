import AuthService from "../services/authService.js"
export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please fill all the required fields!!!" });

    }
    const user= await AuthService.register({
        firstName,
        lastName,
        email,
        password,
    });
    res
    .status(201)
    .json({message: "Registered successfully!!!",user,});
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

export const login = async (req, res, next) => {
  try {
    const{email, password} = req.body;
    if(!email || !password){
        return res
        .status(400)
        .json({message: "Please fill the required fields!!!"});
    }
    const result= await AuthService.login({
        email,
        password,
    });
    res
    .status(201)
    .json({message: "Login successfully!!!",...result,});
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during login", error: error.message });
  }
};

// export default {register,login};