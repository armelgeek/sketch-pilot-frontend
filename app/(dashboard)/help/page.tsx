import { redirect } from "next/navigation";

export default function HelpRedirectPage() {
    redirect("/profile?tab=help");
}
