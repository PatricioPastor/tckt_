import { redirect } from "next/navigation";

export default function SignupPage() {
  redirect("/login?tab=signup");
}
