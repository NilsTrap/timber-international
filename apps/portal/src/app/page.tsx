import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirect to dashboard - auth check will be added in Story 1.3
  redirect("/dashboard");
}
