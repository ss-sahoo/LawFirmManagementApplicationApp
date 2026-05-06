import UsersTable from '@/components/platform-owner/UsersTable';

export default function PlatformOwnerAdvocatesPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Solo Advocates</h1>
        <p className="text-sm text-gray-500 mt-1">Advocates registered independently — not attached to any firm.</p>
      </div>
      <UsersTable userType="advocate" soloOnly />
    </div>
  );
}
