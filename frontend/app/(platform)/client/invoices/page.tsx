import { InvoicesPage } from '@/components/platform/page-templates';
import { ComingSoonMask } from '@/components/platform/ui';

export default function ClientInvoicesPage() {
  return (
    <div className="space-y-6">
      <ComingSoonMask
        title="Invoices Coming Soon"
        message="Full invoice management, payment history, and billing details are currently being integrated for your account."
      />

      {/* Hidden background content for structure */}
      <div className="opacity-40 pointer-events-none filter blur-[1px]">
        <InvoicesPage
          accent="#1f2937"
          roleTitle="Client"
          viewBase="/client/invoices"
        />
      </div>
    </div>
  );
}
