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
    .json({message: "Registered successfully. You can verify your email later in settings.",user,});
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Error registering user" });
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
      .status(error.status || 500)
      .json({ message: error.message || "Error during login" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Email and verification code are required" });
    }

    const user = await AuthService.verifyEmail({ email, code });
    return res.status(200).json({ message: "Email verified successfully", user });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || "Verification failed" });
  }
};

export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    await AuthService.resendVerificationCode({ email });
    return res.status(200).json({ message: "Verification code sent" });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || "Failed to resend code" });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    const result = await AuthService.loginWithGoogle({ idToken });
    return res.status(200).json({ message: "Google login successful", ...result });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || "Google login failed" });
  }
};

// export default {register,login};