import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { AuthOptions } from 'next-auth';

interface UserDocument {
  _id: any;
  email: string;
  password: string;
  role: string;
  firstName: string;  // Include firstName field
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide all required fields');
        }

        await dbConnect();
        const user = (await User.findOne({ email: credentials.email }).lean()) as unknown as UserDocument;

        if (!user) {
          throw new Error('No user found with this email');
        }

        const isPasswordValid = await User.prototype.comparePassword.call(user, credentials.password);

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        console.log('User from DB:', user);

        // Return the user with firstName
        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          firstName: user.firstName,  // Include firstName in the returned object
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('Setting JWT token:', { user });
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;  // Add firstName to the token
      }
      console.log('JWT token:', token);
      return token;
    },
    async session({ session, token }) {
      console.log('Setting session:', { token });
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.firstName = token.firstName;  // Add firstName to the session
      }
      console.log('Final session:', session);
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
