import { Request, Response } from 'express';
import User from '../models/user';  

const generateUserId = (): string => {
  return Math.random().toString(36).substring(2, 7);
};

export const registerUser = async (req: Request, res: Response) => {
  const { username } = req.body;
  const userId = generateUserId();

  const user = new User({ userId, username });
  
  try {
    await user.save();
    res.status(201).json({ userId, username });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
