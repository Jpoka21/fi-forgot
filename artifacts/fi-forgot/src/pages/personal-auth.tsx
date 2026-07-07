import { FiAuthPage } from "@/app/components/auth/FiAuthPage";

interface PersonalAuthPageProps {
  initialMode?: "signup" | "signin";
}

export default function PersonalAuthPage({ initialMode = "signup" }: PersonalAuthPageProps) {
  return <FiAuthPage initialMode={initialMode} />;
}
