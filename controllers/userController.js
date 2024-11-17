require('dotenv').config();
const User=require('../models/UserSchema');
const jwt =require ('jsonwebtoken');
const SECRET_KEY = 'your-secret-key';
const crypto = require('crypto');
const nodemailer = require('nodemailer');





const signup=async(req,res)=>{
   const {email,username,password}=req.body;
   try{
    const newUser= new User({
        email,
        username,
        password,

    });
    await newUser.save();
    res.status(201).json({ message: 'User signed up successfully', user: newUser })
   }
 

   catch(errors){
    console.error('Error signing up user:', errors);
    res.status(500).json({ message: 'Error signing up user', errors });
}

   
}
const signin = async (req, res) => {
    const { email, password } = req.body; // Destructure email and password from request body
  
    try {
      // Find the user by email
      const user = await User.findOne({ email }); // Fetch user with matching email
  
      if (!user) {
        // If no user is found with that email
        return res.status(404).json({ message: 'No user found with this email' });
      }
  
      // Compare the provided password with the one stored in the database
      if (user.password !== password) {
        // If passwords don't match
        return res.status(400).json({ message: 'Invalid credentials, incorrect password' });
       
      }
      const token=jwt.sign({id:user._id, email:user.email ,username:user.username} ,SECRET_KEY,{
        expiresIn: '7d' 
    })
  
      // If everything is okay, return a success message and the user details
      return res.status(200).json({ message: 'Sign in successful', token });
  
    } catch (errors) {
      console.error('Error signing in user:', errors);
      return res.status(500).json({ message: 'Error signing in user', errors });
    }
  };


  
  // Backend route to handle password reset request
// Make sure to set up your email transporter
  
const otpStore = {};

// Setup Nodemailer transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL, 
    pass: process.env.PASSWORD,
  },
});
// Should log your app password


// Function to generate a random password or OTP
const generateRandomPassword = (length = 4) => {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
};

// Function to send the acceptance email with OTP
const forgetPassword = async (req, res) => {
  const { email } = req.body;
  const OTP = generateRandomPassword(4); // Generate a 4-digit OTP

  // Store OTP and email with expiry time (1 minute)
  otpStore[email] = {
    OTP,
    expiresAt: Date.now() + 60000, // OTP expires in 1 minute (60000 ms)
  };

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Password Reset OTP Generation',
    text: `Hello ${email},\n\nYou requested a password reset. Please use the following OTP to reset your password:\n\nOTP: ${OTP}\n\nThis OTP will expire in 1 minute.`,
  };

  try {
    // Sending the email
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');

    // Respond with success message
    res.status(200).json({
      message: 'Password reset OTP sent to your email. It will expire in 1 minute.',
    });

   
  

  } catch (error) {
    console.error('Error sending email:', error);

    // Respond with error message if email fails
    res.status(500).json({
      message: 'Failed to send reset email. Please try again later.',
    });
  }
};
const verifyOTP = async (req, res) => {
  const { otp } = req.body; 
  console.log('otp', otp); // Only OTP is coming from frontend

  // Find the email tied to the OTP in the store
  const email = Object.keys(otpStore).find(email => otpStore[email].OTP === otp);

  if (!email) {
    return res.status(400).json({ message: 'Invalid OTP or OTP has expired.' });
  }
  

  // Check if the OTP has expired
  const otpData = otpStore[email];
  
  if (Date.now() > otpData.expiresAt) {
    delete otpStore[email]; // Delete expired OTP
    return res.status(400).json({ message: 'OTP has expired.' });
  }

  // If OTP is valid and not expired, return success message
  return res.status(200).json({
    message: 'OTP verified successfully. You can now reset your password.',
  });
};


// Verify OTP and reset password
const resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword) {
    return res.status(400).json({ message: 'New password is required.' });
  }
  console.log('pass',newPassword);

  // Retrieve the email from otpStore, assuming OTP has been already verified
  const email = Object.keys(otpStore).find(email => otpStore[email]);
  console.log('email',email);
  if (!email) {
    return res.status(400).json({ message: 'Invalid OTP or OTP has expired.' });
  }

  try {
    // Find the user by email and update their password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Directly update the password (You should hash it before saving in production)
    user.password = newPassword;
    await user.save(); // Save the updated user document

    // OTP is valid, password is updated, now delete OTP from store
    delete otpStore[email]; // Delete OTP after successful password reset

    return res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({ message: 'Failed to update password.' });
  }
};


// Example usage


  

  
  
module.exports={
    signup,  
    signin,
    forgetPassword,
    verifyOTP,
    resetPassword,
} 