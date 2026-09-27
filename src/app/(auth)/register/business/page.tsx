import { AuthGuard } from "@/features/auth/components/auth-guard";
import { RegisterBusinessContent } from "@/features/business/components/register-business-content";

export default function RegisterBusinessPage() {
  return (
    <AuthGuard>
      <RegisterBusinessContent />
    </AuthGuard>
  );
}
