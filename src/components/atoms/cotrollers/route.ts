import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import otp from 'otp-generator';
import nodemailer from 'nodemailer';
import { NextApiRequest, NextApiResponse } from 'next';
import dotenv from 'dotenv';
import { NextResponse } from 'next/server';
dotenv.config();
const prisma = new PrismaClient();
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  port: 465,
  secure: false,
  host: 'smtp.gmail.com',
});
export const Register = async (req:Request, res: NextApiResponse) => {
  try {
 //
 const body=await req.json();
    const { name,email} = body;

    if (!email ) {
      return NextResponse.json({ message: 'Please provide all required fields email' }, { status: 400 });
    }

    const existingUser = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Email is already in use' }, { status: 409 });
    }

    // Hash the password
    // const hashedPassword = bcrypt.hashSync(password, 10);

    // You can proceed to send OTP here
  
    await generaotp(req,res,email,name);

    return NextResponse.json({ message: 'OTP sent. Please verify to complete registration.' }, { status: 200 });
  } catch (error) {
    console.error('Error in Register:', error);
    return NextResponse.json({ error: error || 'Internal server error' }, { status: 500 });
  }
};
export const Login = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await prisma.admin.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, role: 'admin' }, process.env.JWT_SECRET as string, {
      expiresIn: '365d',
    });

    return res.status(200).json({ token, user });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};


export const generaotp = async (req:Request, res: NextApiResponse,email:string,name:string) => {
  // Generate OTP
 
  const OTP =otp.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
    digits: true,
  });
// const body=await req.json();
//   const { name, email, reason } = body;
  // Assuming you have access to adminId from the request or context
// const { name, email, reason, adminId } = body; // Make sure to include adminId
await prisma.otp.create({
  data: {
    otp: OTP,         // The OTP generated using otp-generator
    email: email,     // The admin's email
    // admin: {          // Include the relation to the Admin
    //   connect: { id: adminId }, // connect to the existing Admin with the given ID
    // },
  },
});


  // if (!email || !name || !reason) {
  //   return res.status(400).json({ message: 'Please provide all required fields' });
  // }
  console.log(email);

  const verifyotp = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: 'Account verification OTP',
    html: `<div style="font-family: Poppins, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px; border-radius: 8px; border: 1px solid #dcdcdc;">
      <h1 style="font-size: 24px; font-weight: 600; color: #3b5998; text-align: center; margin-bottom: 25px;">Activate Your ConnectApp Account</h1>
      <div style="background-color: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #3b5998; padding: 20px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
          <h2 style="font-size: 26px; font-weight: 500; color: #fff; text-align: center;">Your Verification Code</h2>
          <h1 style="font-size: 36px; font-weight: bold; color: #fff; text-align: center; margin: 10px 0;">${OTP}</h1>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #555; margin-bottom: 20px;">Hi ${name},</p>
          <p style="font-size: 16px; color: #555; margin-bottom: 20px;">Thanks for signing up for <strong>ConnectApp</strong>! To complete your account activation, please enter the verification code below:</p>
          <p style="font-size: 22px; font-weight: 600; color: #3b5998; text-align: center; margin: 30px 0;">${OTP}</p>
          <p style="font-size: 14px; color: #555;">Enter this code in the ConnectApp to verify your account and start communicating securely.</p>
          <p style="font-size: 14px; color: #555;">If you didn’t create this account, you can safely ignore this email.</p>
        </div>
      </div>
      <br>
      <p style="font-size: 14px; color: #555; text-align: center;">Best regards,<br>The ConnectApp Team</p>
    </div>`
  };

  // const resetpasswordotp = {
  //   from: process.env.EMAIL_USERNAME,
  //   to: email,
  //   subject: "Realtor Reset password verification",
  //   html: `<div style="font-family: Poppins, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
  //     <h1 style="font-size: 22px; font-weight: 500; color: #854CE6; text-align: center; margin-bottom: 30px;">Reset Your Realtor Account Password</h1>
  //     <div style="background-color: #FFF; border: 1px solid #e5e5e5; border-radius: 5px; box-shadow: 0px 3px 6px rgba(0,0,0,0.05);">
  //       <div style="background-color: #854CE6; border-top-left-radius: 5px; border-top-right-radius: 5px; padding: 20px 0;">
  //         <h2 style="font-size: 28px; font-weight: 500; color: #FFF; text-align: center; margin-bottom: 10px;">Verification Code</h2>
  //         <h1 style="font-size: 32px; font-weight: 500; color: #FFF; text-align: center; margin-bottom: 20px;">${OTP}</h1>
  //       </div>
  //       <div style="padding: 30px;">
  //         <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Dear ${name},</p>
  //         <p style="font-size: 14px; color: #666; margin-bottom: 20px;">To reset your Realtor account password, please enter the following verification code:</p>
  //         <p style="font-size: 20px; font-weight: 500; color: #666; text-align: center; margin-bottom: 30px; color: #854CE6;">${OTP}</p>
  //         <p style="font-size: 12px; color: #666; margin-bottom: 20px;">Please enter this code in the Realtor app to reset your password.</p>
  //         <p style="font-size: 12px; color: #666; margin-bottom: 20px;">If you did not request a password reset, please disregard this email.</p>
  //       </div>
  //     </div>
  //     <br>
  //     <p style="font-size: 16px; color: #666; margin-bottom: 20px; text-align: center;">Best regards,<br>The PODSTREAM Team</p>
  //   </div>`
  // };

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // if (reason === "FORGOTPASSWORD") {
  //   transporter.sendMail(resetpasswordotp, (err) => {
  //     if (err) {
  //       return res.status(500).json({ message: "Error sending OTP", error: err });
  //     } else {
  //       return res.status(200).json({ message: "OTP sent for password reset" });
  //     }
  //   });
  // } else {
    try {
      transporter.sendMail(verifyotp, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error sending OTP", error: err });
        } else {
          return res.status(200).json({ message: "OTP sent for account verification" });
        }
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Server error", error });
    }
  }

// Verify OTP
export const verifyOTP = async (req: Request) => {
  try {
    // Parse the body from the request
    const body=await req.json()
    const { code, name, email, password, hospital } = body;

    // Fetch OTP from the database
    const otpRecord = await prisma.otp.findUnique({
      where: { email },
    });

    if (!otpRecord) {
      return NextResponse.json({ message: 'OTP not found or expired' },{status:500});
      // return NextResponse.json({ message: 'Email is already in use' }, { status: 409 });
    }

    // Compare OTP code
    if (parseInt(code) === parseInt(otpRecord.otp)) {
      // Delete OTP from database after successful verification
      await prisma.otp.delete({
        where: { email },
      });

      // Hash the password
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Create a new user (admin) in the database
      const newAdmin = await prisma.admin.create({
        data: {
          name,
          email,
          password: hashedPassword,
          Hospital: hospital,
        },
      });

      // Generate JWT token
      const token = jwt.sign({ id: newAdmin.id, role: 'admin' }, process.env.JWT_SECRET as string, {
        expiresIn: '365d',
      });

      // Return the token and user details
      // return res.status(200).json({ token, user: newAdmin });
      return NextResponse.json({ token, user: newAdmin }, { status: 200 });
    } else {
      // return res.status(400).json({ message: 'Invalid OTP' });
      return NextResponse.json({ message:'INvalid otp' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    // return res.status(500).json({ error: 'An error occurred during OTP verification.' });
    return NextResponse.json({ message:'An error occured during otp verification' }, { status: 500 });
  }
};
