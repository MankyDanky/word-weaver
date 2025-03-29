import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

export async function GET() {
  await dbConnect();
  
  try {
    const users = await User.find({});
    return Response.json({ users });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'An unknown error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  
  try {
    const data = await request.json();
    const user = await User.create(data);
    return Response.json({ user }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'An unknown error occurred' }, { status: 400 });
  }
}