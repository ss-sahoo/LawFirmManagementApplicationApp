import { redirect } from 'next/navigation';

export default function PayoutsRootPage() {
  // Automatically redirect the base payouts route to the advocate tab
  redirect('/super-admin/finance/payouts/advocate');
}
