import { JoinForm } from '@/components/join/JoinForm';

export const dynamic = 'force-dynamic';

export default function JoinPage() {
  const requiresPasscode = !!process.env.JOIN_PASSCODE;
  return <JoinForm requiresPasscode={requiresPasscode} />;
}
