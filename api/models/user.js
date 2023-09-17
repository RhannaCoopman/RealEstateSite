import mongoose from 'mongoose';
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
  username: {
    type: String,
    required: true,
  },
  email: {
    type:String, 
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "manager", "admin"],
  },
  },
  { timestamps: true }
)

const UserModel = mongoose.model('User', UserSchema);
export default UserModel;