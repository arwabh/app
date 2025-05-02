// backend/models/User.ts
import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  roles: string[];
}

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: String,
  verificationCode: String,
  codeExpires: Date,
  roles: [String],
});

export default mongoose.model('User', UserSchema);