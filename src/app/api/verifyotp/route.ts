"use server"
import { NextResponse } from 'next/server';
import { verifyOTP } from '../../../components/atoms/cotrollers/route';
import { NextApiRequest,NextApiResponse } from 'next';
export const POST=async(req: Request, res: NextApiResponse)=>{
  try {
    return await verifyOTP(req, res);
  } catch (error) {
    return NextResponse.json({ message: 'Message not allowed' }, { status: 405 });
  }
  
  
}
