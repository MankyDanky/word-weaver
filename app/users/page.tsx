import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

export default async function UsersPage() {
  await dbConnect();
  const users = await User.find({});
  
  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user._id.toString()}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}