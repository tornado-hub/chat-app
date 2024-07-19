export interface User {
    _id: string;
    username: string;
    email: string;
  }
  
  export interface Message {
    _id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: Date;
  }