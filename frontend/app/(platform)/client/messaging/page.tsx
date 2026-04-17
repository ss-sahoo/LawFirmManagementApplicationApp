import { MessagingPage } from '@/components/platform/page-templates';
import { ComingSoonMask } from '@/components/platform/ui';

export default function ClientMessagingPage() {
  return (
    <div className="space-y-6">
      <ComingSoonMask
        title="Messaging Coming Soon"
        message="Direct communication with your legal team and real-time case updates are currently being built for your account."
      />

      {/* Hidden background content for structure */}
      <div className="opacity-40 pointer-events-none filter blur-[1px]">
        <MessagingPage
          accent="#1f2937"
          roleTitle="Client"
          clientVisible
        />
      </div>
    </div>
  );
}
