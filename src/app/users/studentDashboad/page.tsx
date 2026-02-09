import { redirect } from "next/navigation";

export default function LegacyStudentDashboardPage() {
  redirect("/users/userDashboard");
}
