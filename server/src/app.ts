import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import dotenv from 'dotenv';

dotenv.config();
//console.log('MongoDB URI:', process.env.MONGODB_URI);
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/chat-app"!, {
  // Remove the deprecated options
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error(err);
});

app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
