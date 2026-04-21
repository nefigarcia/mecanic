import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email as string },
          include: {
            tenants: {
              include: { tenant: true },
              where: { activo: true },
            },
          },
        });

        if (!usuario || !usuario.password) return null;
        if (!usuario.activo) return null;

        const valido = await bcrypt.compare(
          credentials.password as string,
          usuario.password
        );

        if (!valido) return null;

        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nombre,
          image: usuario.imagen,
          rol: usuario.rol,
          tenants: usuario.tenants,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.rol = (user as any).rol;
        token.tenants = (user as any).tenants;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).rol = token.rol;
        (session.user as any).tenants = token.tenants;
      }
      return session;
    },
  },
});
