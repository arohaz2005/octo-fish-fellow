import { upsertStreamUser } from '../lib/stream.js';
import User from '../model/User.js';
import jwt from 'jsonwebtoken';


//signup controller
export async function signup(req, res) {
  
  const { username, email, password } = req.body;

  try {
    
    //restrict empty credentials
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    //restrict weak passwords
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    //validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if user already exists
    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });

    if (existingEmail && existingUsername) {
      return res.status(400).json({ message: 'Both email and username already exists' });
    }
    if (existingEmail) {
      return res.status(400).json({ message: 'email already exists' });
    }
    if (existingUsername) {
      return res.status(400).json({ message: 'username already exists' });
    }

    
    // Create new user
    const idx = Math.floor(Math.random() * 100);
    const userAvatar = `https://avatar.iran.liara.run/public/${idx}`;

    const newUser = await User.create({ 
      username, 
      email,
      password,
      profilePicture: userAvatar 
    });

    //Stream auth....
    try {
      await upsertStreamUser({
      id: newUser._id.toString(),
      name: newUser.username,
      email: newUser.email,
      image: newUser.profilePicture || ""
      });
      console.log(`Stream user created for ${newUser.username}`);
    } catch (error) {
    console.error("Error creating stream user: ", error);
    }
    

    // generate jwt
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('jwt', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,      // 7 days
      httpOnly: true, //prevent XSS attacks
      sameSite: "strict", //prevents CSRF attacks
      secure: process.env.NODE_ENV === 'production'
      
    });

    res.status(201).json({ 
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      },
      token 
     });

  } catch (error) {

    res.status(500).json({
       message: 'Server error in signup controller',
       error: error.message 
    });

  }

}

//login controller
export async function signin(req, res) {
  try {

    const { email, password } = req.body;

    if(!email || !password) {
      return res.status(400).json({
        message: "All fields are required!"
      })
    }

    //find the user from db
    const user = await User.findOne({ email });

    if(!user) 
    return res.status(401).json({ message: "Invalid email or password!" })
    
    //check if password is valid
    const isPassCorrect = await user.matchPassword(password);

    if(!isPassCorrect) 
      return res.status(401).json({ message: "Invalid email or password!"})

    //jwt
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('jwt', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,      // 7 days 
      httpOnly: true, //prevent XSS attacks
      sameSite: "strict", //prevents CSRF attacks
      secure: process.env.NODE_ENV === 'production'
      
    });
    
    res.status(200).json({ 
      success: true,
      message: 'logged in successfully',
      token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {

    console.log("Error in login controller!", error.message);
    res.status(500).json({ message: "Internal server error!" });
  }
}

//logout controller
export async function logout(req, res) {
  
  res.clearCookie("jwt");
  res.clearCookie("token");

  res.status(200).json ({ 
    success: true,
    message: "Log out successful!"
  });
}

//Onboarding controller
export async function onboard(req, res) {
  
  try {
    const userId = req.user._id;

    //extract onboarding data from req body
    const { username, bio, profilePicture, nativeLanguage, learningLanguage, location } = req.body;

    if(!username || !bio || !nativeLanguage || !location) {
      return res.status(400).json({
        message: "Required fields are missing!",
        missingFields: [
          !username && "username",
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          !location && "location"
        ].filter(Boolean)
      });
    }
    
    //upsert db user info
    const updatedUser = await User.findByIdAndUpdate(userId, {
      ...req.body,
      isOnboarded: true,
    }, { new: true })

    if(!updatedUser)
      return res.status(404).json({ message: "User not found!" });

     //UPDATE STREAM DB USER INFO 
      try {

        const upsertStream = await upsertStreamUser({
         id: updatedUser._id.toString(),
         name: updatedUser.username,
         image: updatedUser.profilePicture || ""
        })
      
        if (upsertStream) {
          console.log(`Stream user updated for ${updatedUser.username}`);
      }
        if(updatedUser)
          return res.status(200).json({ success:true, user:updatedUser });

      } catch (streamError) {
           console.error("Error updating stream user during onboarding: ", streamError);
      }

  } catch (error) {
    console.error("Onboarding error: ", error.message);
    res.status(500).json({ message: "Internal server error! "});
  }
}