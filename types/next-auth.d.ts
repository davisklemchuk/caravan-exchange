import 'next-auth';

declare module 'next-auth' {
  interface User {
    firstName?: string;
    role?: string;
  }
  
  interface Session {
    user: {
      id?: string;
      firstName?: string;
      role?: string;
    } & DefaultSession['user'];
  }
} 