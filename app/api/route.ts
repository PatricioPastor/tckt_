import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }     
  
  const users = await prisma.user.findMany();
  return NextResponse.json(session);
}
