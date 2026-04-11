'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  CheckSquare,
  CreditCard,
  FileText,
  Gavel,
  MessageSquare,
  PenTool,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  ActivityFeed,
  ActionLink,
  Badge,
  DetailList,
  DocumentHistory,
  FormGrid,
  MetricCard,
  PageSection,
  Panel,
  RecoveryCard,
  SearchBar,
  SimpleTabs,
  SplitPanels,
  Timeline,
} from '@/components/platform/ui';
import {
  activityRows,
  caseFormFields,
  caseTimeline,
  clientFields,
  documentRows,
  hearingRows,
  invoiceRows,
  reportCards,
  teamFields,
} from '@/components/platform/mock-data';
import { customFetch } from '@/lib/fetch';
import { API } from '@/lib/api';
import { Loader2, PlusCircle, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const classNames = (...classes: any[]) => classes.filter(Boolean).join(' ');

type AccentProps = {
  accent: string;
};

type Metric = {
  label: string;
  value: string;
  hint?: string;
};

type TableColumn = {
  key: string;
  label: string;
};

type TableRow = Record<string, string | undefined> & {
  viewHref?: string;
};

function MetricGrid({ accent, metrics }: AccentProps & { metrics: Metric[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} accent={accent} {...metric} />
      ))}
    </div>
  );
}

function DataTable({
  columns,
  rows,
}: {
  columns: TableColumn[];
  rows: TableRow[];
}) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filteredRows = useMemo(
    () =>
      rows.filter((row) =>
        Object.entries(row)
          .filter(([key]) => key !== 'viewHref')
          .some(([, value]) => String(value).toLowerCase().includes(query.toLowerCase()))
      ),
    [query, rows]
  );

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pagedRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-[#f7f8fa] px-3 py-2">
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Search list..."
          className="w-full bg-transparent text-sm text-gray-600 outline-none placeholder:text-gray-400"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-[#f7f8fa]">
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">Sl. No</th>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pagedRows.map((row, index) => (
              <tr key={`${row[columns[0].key]}-${index}`}>
                <td className="px-4 py-4 text-sm font-semibold text-gray-700">{(safePage - 1) * pageSize + index + 1}</td>
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4 text-sm text-gray-600">
                    {row[column.key]}
                  </td>
                ))}
                <td className="px-4 py-4">
                  {row.viewHref ? (
                    <Link href={row.viewHref} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-[#0e2340] hover:bg-gray-50">
                      View
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <button className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-[#0e2340] hover:bg-gray-50">
                      View
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <p className="text-xs text-gray-400">
          Showing {pagedRows.length} of {filteredRows.length} entries
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            Prev
          </button>
          <span className="text-xs font-semibold text-gray-500">
            {safePage} / {pageCount}
          </span>
          <button
            onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoAside({ accent, title, items }: AccentProps & { title: string; items: string[] }) {
  return (
    <Panel title={title} subtitle="Implementation placeholder">
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-[#f7f8fa] p-4">
            <div className="mt-0.5 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
            <p className="text-sm text-gray-600">{item}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

const caseRows = [
  {
    matter: 'State vs Mehta',
    number: 'CRL-2026-1042',
    acts: 'IPC 420, CrPC 154',
    status: 'Evidence Stage',
    advocate: 'Ritika Iyer',
    hearing: '31 Mar 2026',
  },
  {
    matter: 'Apex Traders Arbitration',
    number: 'ARB-2026-031',
    acts: 'Arbitration Act',
    status: 'Draft Filing',
    advocate: 'Arjun Sharma',
    hearing: '04 Apr 2026',
  },
  {
    matter: 'Kumar Property Appeal',
    number: 'CIV-2026-220',
    acts: 'Transfer of Property Act',
    status: 'Judgment Reserved',
    advocate: 'Neha Sethi',
    hearing: '07 Apr 2026',
  },
];

export function PlatformFirmsHub({ accent, limited }: AccentProps & { limited?: boolean }) {
  const metrics = limited
    ? [
      { label: 'Assigned Firms', value: '18', hint: '9 active this week' },
      { label: 'Pending Onboarding', value: '4', hint: 'Awaiting owner confirmation' },
      { label: 'Renewals Due', value: '6', hint: 'Next 30 days' },
      { label: 'Partner Notes', value: '12', hint: 'Internal follow-ups open' },
    ]
    : [
      { label: 'Total Firms', value: '148', hint: '22 onboarded this month' },
      { label: 'Active Users', value: '1,264', hint: 'Across all law firms' },
      { label: 'Pending Bills', value: 'Rs. 8.2L', hint: 'Platform-wide receivables' },
      { label: 'Login Audits', value: '4,920', hint: 'Last 30 days' },
    ];

  const rows = limited
    ? [
      { firm: 'Legal Experts LLP', owner: 'Arjun Sharma', plan: 'Growth', status: 'Active', renewal: '18 Apr 2026', activity: 'Case sync yesterday' },
      { firm: 'Mehra Chambers', owner: 'K. Mehra', plan: 'Trial', status: 'Pending', renewal: '05 Apr 2026', activity: 'OTP pending' },
    ]
    : [
      { firm: 'Chen & Associates', owner: 'Sarah Chen', plan: 'Enterprise', status: 'Active', renewal: '15 Apr 2026', activity: '144 sign-ins this week' },
      { firm: 'Torres Law Group', owner: 'Michael Torres', plan: 'Growth', status: 'Active', renewal: '30 Apr 2026', activity: '12 new matters' },
      { firm: 'Davis Legal', owner: 'Emily Davis', plan: 'Trial', status: 'Suspended', renewal: 'Expired', activity: 'Payment failed twice' },
    ];

  return (
    <div className="space-y-8">
      <PageSection
        eyebrow={limited ? 'Assigned Firms' : 'Platform Firms'}
        title={limited ? 'Firm Onboarding and Relationship Desk' : 'Law Firm Management'}
        description={
          limited
            ? 'Create firms, review basic details, and manage relationship notes without exposing internal firm matters.'
            : 'Register firms, manage owner credentials, assign partner or sales ownership, and review billing, login, and adoption signals.'
        }
        actions={
          <>
            <ActionLink href={limited ? '/partner-manager/firms/new' : '/platform-owner/firms/new'} label="Create Firm" />
            <ActionLink href={limited ? '/partner-manager/settings' : '/platform-owner/billing'} label={limited ? 'Partner Settings' : 'Review Billing'} tone="light" />
          </>
        }
      />
      <MetricGrid accent={accent} metrics={metrics} />
      <SplitPanels
        left={
          <Panel
            title={limited ? 'Assigned Firms' : 'Firm Directory'}
            subtitle="Searchable overview of law firms, plans, and owner credentials."
            actions={<SearchBar placeholder="Search firms, owners, or codes..." />}
          >
            <DataTable
              columns={[
                { key: 'firm', label: 'Firm' },
                { key: 'owner', label: 'Owner' },
                { key: 'plan', label: 'Plan' },
                { key: 'status', label: 'Status' },
                { key: 'renewal', label: 'Renewal' },
                { key: 'activity', label: 'Recent Activity' },
              ]}
              rows={rows}
            />
          </Panel>
        }
        right={
          <InfoAside
            accent={accent}
            title={limited ? 'Restricted Access' : 'Platform Controls'}
            items={
              limited
                ? [
                  'No access to cases, documents, or internal team records.',
                  'Editable fields stay limited to firm basics, contacts, and plan context.',
                  'Internal relationship notes remain partner-facing only.',
                ]
                : [
                  'Firm records remain platform-owned and cannot be deleted from firm-owner accounts.',
                  'Login history, sign-up activity, and billing stats are visible at platform level.',
                  'Referral, partner, and sales ownership are tracked per firm record.',
                ]
            }
          />
        }
      />
    </div>
  );
}

export function FirmFormPage({
  accent,
  title,
  description,
  limited,
}: AccentProps & { title: string; description: string; limited?: boolean }) {
  const firmFields = [
    { label: 'Firm Name', placeholder: 'Chen & Associates' },
    { label: 'Firm Code', placeholder: 'CHEN-2026' },
    { label: 'Owner Full Name', placeholder: 'Sarah Chen' },
    { label: 'Email Address', placeholder: 'owner@firm.com', type: 'email' },
    { label: 'Phone Number', placeholder: '+91 98XXXXXX45' },
    { label: 'Username', placeholder: 'sarah.chen' },
    { label: 'Password', placeholder: 'Auto-generated or set by owner', type: 'password' },
    { label: 'City', placeholder: 'Mumbai' },
    { label: 'State', placeholder: 'Maharashtra' },
    { label: 'Country', placeholder: 'India' },
    { label: 'Plan', placeholder: limited ? 'Growth' : 'Enterprise' },
    { label: 'Referral / Sales Owner', placeholder: limited ? 'Current Partner Manager' : 'Assigned sales person' },
  ];

  return (
    <div className="space-y-8">
      <PageSection eyebrow="Onboarding" title={title} description={description} />
      <SplitPanels
        left={
          <Panel title="Firm Registration Form" subtitle="Minimal firm record, owner credentials, and onboarding metadata.">
            <FormGrid fields={firmFields} columns={3} />
          </Panel>
        }
        right={
          <div className="space-y-6">
            <InfoAside
              accent={accent}
              title="System Actions"
              items={[
                'Generate firm credentials and notify the firm owner.',
                'Mark phone verification as pending OTP confirmation.',
                'Attach subscription plan, referral owner, and onboarding notes.',
              ]}
            />
            <Panel title="Actions" subtitle="Mock workflow buttons">
              <div className="flex flex-wrap gap-3">
                <button className="rounded-xl bg-[#0e2340] px-4 py-2.5 text-sm font-semibold text-white">Create Firm</button>
                <button className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700">Save Draft</button>
                <button className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700">Cancel</button>
              </div>
            </Panel>
          </div>
        }
      />
    </div>
  );
}

export function FirmDetailPage({
  accent,
  title,
  limited,
}: AccentProps & { title: string; limited?: boolean }) {
  const details = limited
    ? [
      { label: 'Firm Name', value: 'Legal Experts LLP' },
      { label: 'Owner', value: 'Arjun Sharma' },
      { label: 'Plan', value: 'Growth' },
      { label: 'Renewal', value: '18 Apr 2026' },
      { label: 'Last Activity', value: 'Case sync completed yesterday' },
      { label: 'Partner Notes', value: 'Awaiting branch expansion quote' },
    ]
    : [
      { label: 'Firm Name', value: 'Chen & Associates' },
      { label: 'Registration Number', value: 'BC/1842/2010' },
      { label: 'Address', value: 'Fort, Mumbai, Maharashtra' },
      { label: 'Phone', value: '+91 98XXXXXX45' },
      { label: 'Total Cases', value: '142' },
      { label: 'Total Users', value: '12' },
      { label: 'Pending Bills', value: 'Rs. 82,000' },
      { label: 'Paid Bills', value: 'Rs. 4,52,000' },
    ];

  return (
    <div className="space-y-8">
      <PageSection
        eyebrow={limited ? 'Assigned Firm' : 'Firm Profile'}
        title={title}
        description={limited ? 'Basic firm overview, contact details, plan information, and partner notes.' : 'Platform-owned firm profile with registration, billing, login history, and onboarding context.'}
      />
      <MetricGrid
        accent={accent}
        metrics={
          limited
            ? [
              { label: 'Plan Health', value: 'Stable', hint: 'No renewal risk this month' },
              { label: 'Open Notes', value: '3', hint: 'Internal relationship comments' },
              { label: 'Support Requests', value: '2', hint: 'Awaiting response' },
              { label: 'Recent Logins', value: '17', hint: 'Past 7 days' },
            ]
            : [
              { label: 'Sign-Ups', value: '34', hint: 'Across all users' },
              { label: 'Login Events', value: '264', hint: 'Past 30 days' },
              { label: 'Open Invoices', value: '5', hint: '2 overdue' },
              { label: 'Active Cases', value: '45', hint: '82 disposed, 15 closed' },
            ]
        }
      />
      <SplitPanels
        left={<Panel title="Overview" subtitle="Core firm details and controls"><DetailList items={details} columns={2} /></Panel>}
        right={<InfoAside accent={accent} title="Notes" items={limited ? ['Restricted to overview, contacts, and plan info.', 'No access to cases, documents, or internal staff detail.'] : ['Firm owner cannot delete these records from their account.', 'Suspension, blocking, and audit review remain platform-controlled.']} />}
      />
    </div>
  );
}

export function PartnerOrSalesDetailPage({
  accent,
  title,
  entity,
}: AccentProps & { title: string; entity: 'partner' | 'sales' }) {
  const detailItems = entity === 'partner'
    ? [
      { label: 'Name', value: 'Anita Khanna' },
      { label: 'Assigned Firms', value: '18' },
      { label: 'Renewals This Month', value: '6' },
      { label: 'Role Scope', value: 'Onboarding and relationship management' },
    ]
    : [
      { label: 'Name', value: 'Rohan Sethi' },
      { label: 'Territory', value: 'Mumbai and Pune' },
      { label: 'Referrals', value: '12 active leads' },
      { label: 'Conversion Rate', value: '31%' },
    ];

  return (
    <div className="space-y-8">
      <PageSection
        eyebrow={entity === 'partner' ? 'Partner Manager' : 'Sales Person'}
        title={title}
        description={entity === 'partner' ? 'Platform-level user with limited access to firm onboarding and relationship status.' : 'Referral and sales ownership profile for platform growth tracking.'}
      />
      <SplitPanels
        left={<Panel title="Overview" subtitle="Current workload and ownership metadata"><DetailList items={detailItems} columns={2} /></Panel>}
        right={<InfoAside accent={accent} title="Internal Workflow" items={entity === 'partner' ? ['Can create firms and assign plan context.', 'Cannot suspend firms or view internal case data.'] : ['Tracks referral source, lead notes, and conversion state.', 'Operational access remains limited to commercial context only.']} />}
      />
    </div>
  );
}

export function BillingHubPage({
  accent,
  title,
  description,
  viewBase,
}: AccentProps & { title: string; description: string; viewBase?: string }) {
  return (
    <div className="space-y-8">
      <PageSection eyebrow="Billing" title={title} description={description} />
      <MetricGrid accent={accent} metrics={invoiceRows} />
      <SplitPanels
        left={
          <Panel title="Invoice Pipeline" subtitle="Open invoices, remittances, and escalation status.">
            <DataTable
              columns={[
                { key: 'invoice', label: 'Invoice' },
                { key: 'owner', label: 'Account' },
                { key: 'amount', label: 'Amount' },
                { key: 'status', label: 'Status' },
                { key: 'due', label: 'Due Date' },
              ]}
              rows={[
                { invoice: 'INV-2041', owner: 'Chen & Associates', amount: 'Rs. 84,000', status: 'Pending', due: '31 Mar 2026', viewHref: viewBase ? `${viewBase}/2041` : undefined },
                { invoice: 'INV-2042', owner: 'Torres Law Group', amount: 'Rs. 1,40,000', status: 'Paid', due: '25 Mar 2026', viewHref: viewBase ? `${viewBase}/2042` : undefined },
                { invoice: 'INV-2043', owner: 'Davis Legal', amount: 'Rs. 32,000', status: 'Overdue', due: '18 Mar 2026', viewHref: viewBase ? `${viewBase}/2043` : undefined },
              ]}
            />
          </Panel>
        }
        right={<InfoAside accent={accent} title="Payment Controls" items={['Track pending and paid bills side by side.', 'Flag overdue balances for follow-up and escalation.', 'Reserve space for invoice PDF, gateway, and receipt integration later.']} />}
      />
    </div>
  );
}

export function SettingsPageTemplate({
  accent,
  title,
  description,
}: AccentProps & { title: string; description: string }) {
  return (
    <div className="space-y-8">
      <PageSection eyebrow="Settings" title={title} description={description} />
      <SplitPanels
        left={
          <div className="space-y-8">
            <ProfileInformationPanel accent={accent} />
            <ChangePasswordPanel accent={accent} />
          </div>
        }
        right={<InfoAside accent={accent} title="Preference Areas" items={['Identity and verification', 'Notification and reminder preferences', 'Access control visibility and internal audit reminders']} />}
      />
    </div>
  );
}

export function CasesPage({
  accent,
  title,
  description,
  primaryHref,
  primaryLabel,
  viewBase,
}: AccentProps & { title: string; description: string; primaryHref?: string; primaryLabel?: string; viewBase?: string }) {
  return (
    <div className="space-y-8">
      <PageSection
        title={title}
        description={description}
        actions={primaryHref && primaryLabel ? <ActionLink href={primaryHref} label={primaryLabel} /> : undefined}
      />


      <Panel title="Case Register" subtitle="Search, filter, and review current matters." actions={<SearchBar placeholder="Search case title, number, or advocate..." />}>
        <SimpleTabs tabs={[{ label: 'All Cases', active: true }, { label: 'Running' }, { label: 'Disposed Off' }, { label: 'Closed' }]} />
        <div className="mt-4">
          <DataTable
            columns={[
              { key: 'matter', label: 'Matter' },
              { key: 'number', label: 'Case Number' },
              { key: 'acts', label: 'Acts' },
              { key: 'status', label: 'Status' },
              { key: 'advocate', label: 'Assigned Advocate' },
              { key: 'hearing', label: 'Next Hearing' },
            ]}
            rows={caseRows.map((row, index) => ({ ...row, viewHref: viewBase ? `${viewBase}/${index + 1}` : undefined }))}
          />
        </div>
      </Panel>

    </div>
  );
}

export function CaseCreatePage({ accent }: AccentProps) {
  return (
    <div className="space-y-8">


      <Panel title="Case Creation Form" subtitle="Case registration and matter management schema.">
        <FormGrid fields={caseFormFields} columns={2} />
      </Panel>
    </div>
  );
}

export function CaseDetailPage({
  accent,
  roleTitle,
  allowChat,
  allowApprovals,
  clientMode,
}: AccentProps & { roleTitle: string; allowChat?: boolean; allowApprovals?: boolean; clientMode?: boolean }) {
  return (
    <div className="space-y-8">
      <PageSection
        eyebrow="Case Lifecycle"
        title={`${roleTitle} Case Detail`}
        description={
          clientMode
            ? 'Simplified lifecycle view with progress, documents, hearings, and invoice access.'
            : 'Overview, lifecycle, documents, hearing activity, drafts, and audit history for the selected matter.'
        }
      />
      <MetricGrid
        accent={accent}
        metrics={[
          { label: clientMode ? 'Progress' : 'Current Stage', value: clientMode ? '72%' : 'Evidence' },
          { label: 'Next Hearing', value: '31 Mar 2026', hint: 'Sessions Court - Room 4' },
          { label: 'Documents', value: '24', hint: '4 with version history' },
          { label: 'Open Tasks', value: allowApprovals ? '6' : '4', hint: 'Deadlines and hearing prep' },
        ]}
      />
      <SplitPanels
        left={
          <div className="space-y-6">
            <Panel title="Case Overview" subtitle="Core matter information, assignment, and court context.">
              <DetailList
                items={[
                  { label: 'Case Title', value: 'State vs Mehta' },
                  { label: 'Case Number', value: 'CRL-2026-1042' },
                  { label: 'Status', value: <Badge label="Evidence Stage" tone="warning" /> },
                  { label: 'Assigned Advocate', value: 'Ritika Iyer' },
                  { label: 'Court Details', value: 'Sessions Court, Mumbai' },
                  { label: 'Applicable Acts', value: 'IPC 420, CrPC 154' },
                ]}
                columns={2}
              />
            </Panel>
            <Panel title="Lifecycle Timeline" subtitle="Status transitions and date-wise updates.">
              <Timeline items={caseTimeline} />
            </Panel>
            <Panel title="Document History" subtitle="FIR, petitions, evidence, orders, agreements, and affidavits.">
              <DocumentHistory rows={documentRows} />
            </Panel>
          </div>
        }
        right={
          <div className="space-y-6">
            <Panel title="Hearing and Court Activity" subtitle="Dates, adjournments, orders, and judge remarks.">
              <DetailList items={hearingRows} columns={2} />
            </Panel>
            {!clientMode ? (
              <Panel title="Draft and Petition Tracking" subtitle="Draft submissions, approval status, and revision history.">
                <ActivityFeed
                  items={[
                    { actor: 'Draft v4', action: allowApprovals ? 'awaits admin approval and legal sign-off.' : 'submitted for review.', time: 'Today, 9:10 AM' },
                    { actor: 'Petition Tracker', action: 'shows 2 revisions after court objections.', time: 'Yesterday, 6:30 PM' },
                  ]}
                />
              </Panel>
            ) : null}
            <Panel title={clientMode ? 'Progress Notes' : 'Internal Activity Feed'} subtitle={clientMode ? 'Latest visible updates shared with the client.' : 'Audit trail of activity, logins, and internal tracking.'}>
              <ActivityFeed items={activityRows} />
            </Panel>
            {allowChat ? <InfoAside accent={accent} title="Communication" items={['Direct client messaging is enabled for this role.', 'Message thread supports status follow-ups and hearing reminders.']} /> : null}
          </div>
        }
      />
    </div>
  );
}

export function TeamPage({ accent, viewBase, role }: AccentProps & { viewBase?: string; role?: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await customFetch(API.USERS.LIST);
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.detail || 'Failed to fetch users');
        
        let results = data.results || data;
        if (role) {
          results = results.filter((u: any) => u.user_type === role);
        }
        setUsers(results);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [role]);

  const rows = users.map((u, i) => ({
    name: `${u.first_name} ${u.last_name}`,
    role: u.user_type,
    practice: u.practice_area || 'N/A',
    cases: '0',
    status: u.is_active ? 'Active' : 'Inactive',
    viewHref: viewBase ? `${viewBase}/${u.id}` : undefined,
  }));

  const metrics = [
    { label: 'Total Members', value: users.length.toString() },
    { label: 'Active', value: users.filter(u => u.is_active).length.toString() },
    { label: 'Inactive', value: users.filter(u => !u.is_active).length.toString() },
    { label: 'Pending', value: '0' },
  ];

  return (
    <div className="space-y-8">
      <PageSection 
        eyebrow="Team Management" 
        title={`${role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Firm'} Team Directory`} 
        description="Create and manage your team members with role-aware access and workload visibility." 
        actions={<ActionLink href={`${viewBase}/new`} label={`Add ${role || 'Member'}`} />} 
      />
      <MetricGrid accent={accent} metrics={metrics} />
      <Panel title="Current Team" subtitle="Role, workload, and access status">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="mt-4 text-sm text-gray-400">Loading team data...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100">
            <p className="text-sm font-medium">Error: {error}</p>
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'name', label: 'Member' },
              { key: 'role', label: 'Role' },
              { key: 'practice', label: 'Practice Area' },
              { key: 'cases', label: 'Cases' },
              { key: 'status', label: 'Status' },
            ]}
            rows={rows}
          />
        )}
      </Panel>
    </div>
  );
}

export function UserDetailPage({ accent, userId }: AccentProps & { userId: string }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await customFetch(API.USERS.DETAIL(userId));
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.detail || 'Failed to fetch user details');
        
        setUser(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setEditData({
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        address_line_1: user.address_line_1,
        address_line_2: user.address_line_2,
        city: user.city,
        state: user.state,
        country: user.country,
        postal_code: user.postal_code,
        date_of_birth: user.date_of_birth,
        gender: user.gender,
        aadhar_number: user.aadhar_number,
        pan_number: user.pan_number,
        bar_council_registration: user.bar_council_registration,
        bar_council_state: user.bar_council_state,
        is_active: user.is_active,
      });
    }
  }, [user, isEditing]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await customFetch(API.USERS.DETAIL(userId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.detail || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: string, value: any) => setEditData((p: any) => ({ ...p, [key]: value }));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <p className="mt-4 text-sm text-gray-400">Loading user profile...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-12 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100">
        <p className="text-sm font-medium">Error: {error || 'User not found'}</p>
      </div>
    );
  }

  const profileItems = [
    { label: 'Full Name', value: `${user.first_name} ${user.last_name}` },
    { label: 'Username', value: user.username },
    { label: 'Email', value: user.email },
    { label: 'Phone', value: user.phone_number },
    { label: 'User Type', value: <Badge label={user.user_type} tone="info" /> },
    { label: 'Firm Name', value: user.firm_name || 'N/A' },
  ];

  const addressItems = [
    { label: 'Address Line 1', value: user.address_line_1 || '--' },
    { label: 'Address Line 2', value: user.address_line_2 || '--' },
    { label: 'City', value: user.city || '--' },
    { label: 'State', value: user.state || '--' },
    { label: 'Country', value: user.country || '--' },
    { label: 'Postal Code', value: user.postal_code || '--' },
  ];

  const verificationItems = [
    { label: 'Email Verified', value: <Badge label={user.is_email_verified ? 'Verified' : 'Pending'} tone={user.is_email_verified ? 'success' : 'warning'} /> },
    { label: 'Phone Verified', value: <Badge label={user.is_phone_verified ? 'Verified' : 'Pending'} tone={user.is_phone_verified ? 'success' : 'warning'} /> },
    { label: 'Document Verified', value: <Badge label={user.is_document_verified ? 'Verified' : 'Pending'} tone={user.is_document_verified ? 'success' : 'warning'} /> },
    { label: 'Account Status', value: <Badge label={user.is_active ? 'Active' : 'Inactive'} tone={user.is_active ? 'success' : 'danger'} /> },
  ];

  const legalItems = user.user_type === 'advocate' ? [
    { label: 'Bar Council Reg', value: user.bar_council_registration || '--' },
    { label: 'Bar Council State', value: user.bar_council_state || '--' },
    { label: 'PAN Number', value: user.pan_number || '--' },
    { label: 'Aadhar Number', value: user.aadhar_number || '--' },
  ] : [];

  return (
    <div className="space-y-8">
      <PageSection 
        eyebrow="User Profile" 
        title={`${user.first_name} ${user.last_name}`} 
        description={`Full breakdown of account details, firm association, and verified credentials for ${user.user_type}.`} 
        actions={
          isEditing ? (
             <div className="flex gap-2">
                <button 
                  onClick={handleUpdate} 
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0e2340] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a3a5c] disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </button>
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
             </div>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <PenTool className="h-4 w-4" /> Edit Profile
            </button>
          )
        }
      />

      <SplitPanels
        left={
          <div className="space-y-6">
            <Panel title="Identity & Contact" subtitle="Basic personal and role information.">
              {isEditing ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">First Name</label>
                    <input value={editData.first_name} onChange={e => updateField('first_name', e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-gray-700 outline-none" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Last Name</label>
                    <input value={editData.last_name} onChange={e => updateField('last_name', e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-gray-700 outline-none" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Phone Number</label>
                    <input value={editData.phone_number} onChange={e => updateField('phone_number', e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-gray-700 outline-none" />
                  </div>
                   <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Gender</label>
                    <select value={editData.gender} onChange={e => updateField('gender', e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-gray-700 outline-none">
                      <option value="">Select Gender</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Date of Birth</label>
                    <input type="date" value={editData.date_of_birth || ''} onChange={e => updateField('date_of_birth', e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-gray-700 outline-none" />
                  </div>
                </div>
              ) : (
                <DetailList items={profileItems} columns={2} />
              )}
            </Panel>
            
            <Panel title="Location Details" subtitle="Full residential or office address.">
              {isEditing ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Address Line 1</label>
                    <input value={editData.address_line_1} onChange={e => updateField('address_line_1', e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-gray-700 outline-none" />
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Address Line 2</label>
                    <input value={editData.address_line_2} onChange={e => updateField('address_line_2', e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-gray-700 outline-none" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">City</label>
                    <input value={editData.city} onChange={e => updateField('city', e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-gray-700 outline-none" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">State</label>
                    <input value={editData.state} onChange={e => updateField('state', e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-gray-700 outline-none" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Postal Code</label>
                    <input value={editData.postal_code} onChange={e => updateField('postal_code', e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-gray-700 outline-none" />
                  </div>
                </div>
              ) : (
                <DetailList items={addressItems} columns={3} />
              )}
            </Panel>

            {(legalItems.length > 0 || isEditing) && user.user_type === 'advocate' && (
              <Panel title="Legal Credentials" subtitle="Professional and tax identity records.">
                {isEditing ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Bar Council Reg</label>
                      <input value={editData.bar_council_registration} onChange={e => updateField('bar_council_registration', e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-gray-700 outline-none" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Bar Council State</label>
                      <input value={editData.bar_council_state} onChange={e => updateField('bar_council_state', e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-gray-700 outline-none" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">PAN Number</label>
                      <input value={editData.pan_number} onChange={e => updateField('pan_number', e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-gray-700 outline-none" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Aadhar Number</label>
                      <input value={editData.aadhar_number} onChange={e => updateField('aadhar_number', e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-gray-700 outline-none" />
                    </div>
                  </div>
                ) : (
                  <DetailList items={legalItems} columns={2} />
                )}
              </Panel>
            )}
            
            <Panel title="Firm History" subtitle="Current and past law firm associations.">
              <DataTable
                columns={[
                  { key: 'firm_name', label: 'Firm' },
                  { key: 'user_type', label: 'Role' },
                  { key: 'is_active', label: 'Active' },
                  { key: 'branch', label: 'Branch' },
                ]}
                rows={user.available_firms?.map((f: any) => ({
                  firm_name: f.firm_name,
                  user_type: f.user_type,
                  is_active: f.is_active ? 'Yes' : 'No',
                  branch: f.branch || 'Main',
                })) || []}
              />
            </Panel>
          </div>
        }
        right={
          <div className="space-y-6">
            <Panel title="Verification Status" subtitle="System-level trust indicators.">
              {isEditing ? (
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Account Active</span>
                      <button 
                        onClick={() => updateField('is_active', !editData.is_active)}
                        className={classNames(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none",
                          editData.is_active ? "bg-[#0e2340]" : "bg-gray-200"
                        )}
                      >
                        <span className={classNames(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          editData.is_active ? "translate-x-5" : "translate-x-0"
                        )} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">Deactivating an account will prevent the user from logging in until reactivated.</p>
                 </div>
              ) : (
                <DetailList items={verificationItems} columns={2} />
              )}
            </Panel>
            
            <Panel title="System Metadata" subtitle="Audit trail and security info.">
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-semibold uppercase tracking-wider">Account Created</span>
                  <span className="text-gray-600 font-bold">{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-semibold uppercase tracking-wider">Last Updated</span>
                  <span className="text-gray-600 font-bold">{new Date(user.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-semibold uppercase tracking-wider">Password Set</span>
                  <span className="text-gray-600 font-bold">{user.password_set ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </Panel>
            
            <InfoAside
              accent={accent}
              title="Profile Integrity"
              items={[
                'Verify all credentials before document assignment.',
                'Role-specific permissions are synced globally.',
                'Audit logs capture all profile modifications.'
              ]}
            />
            {error && <p className="text-xs font-semibold text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
          </div>
        }
      />
    </div>
  );
}

export function TeamMemberFormPage({
  accent,
  detail,
  title,
  description,
  fixedRole,
}: AccentProps & { detail?: boolean; title?: string; description?: string; fixedRole?: string }) {
  const router = useRouter();
  const [formData, setFormData] = useState<any>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    user_type: fixedRole || 'advocate',
    practice_area: '',
    firm: '',
  });
  const [firms, setFirms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (formData.user_type === 'super_admin' || formData.user_type === 'partner_manager') {
      customFetch(API.FIRMS.LIST)
        .then(res => res.json())
        .then(data => {
          if (data.results) setFirms(data.results);
          else if (Array.isArray(data)) setFirms(data);
        })
        .catch(err => console.error('Failed to fetch firms:', err));
    }
  }, [formData.user_type]);

  const roles = [
    { label: 'Admin', value: 'admin' },
    { label: 'Advocate', value: 'advocate' },
    { label: 'Paralegal', value: 'paralegal' },
    { label: 'Client', value: 'client' },
    { label: 'Partner Manager', value: 'partner_manager' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await customFetch(API.USERS.ADD_USER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.detail || 'Failed to create user');
      }

      router.back();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, value: string) => setFormData((p: any) => ({ ...p, [key]: value }));

  return (
    <div className="space-y-8">
      <PageSection
        eyebrow="Team"
        title={title ?? (detail ? 'Team Member Profile' : 'Add Team Member')}
        description={description ?? (detail ? 'Role scope, assignment load, and access visibility for an individual user.' : 'Create a new team member with controlled access.')}
      />
      <form onSubmit={handleSubmit}>
        <SplitPanels
          left={
            <Panel title={detail ? 'Member Details' : 'Member Form'} subtitle="Core identity, role, and contact information.">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">First Name</label>
                  <input value={formData.first_name} onChange={e => update('first_name', e.target.value)} required placeholder="John" className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-gray-700 outline-none placeholder:text-gray-400" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Last Name</label>
                  <input value={formData.last_name} onChange={e => update('last_name', e.target.value)} required placeholder="Doe" className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-gray-700 outline-none placeholder:text-gray-400" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Email Address</label>
                  <input type="email" value={formData.email} onChange={e => update('email', e.target.value)} required placeholder="john@example.com" className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-gray-700 outline-none placeholder:text-gray-400" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Phone Number</label>
                  <input value={formData.phone_number} onChange={e => update('phone_number', e.target.value)} required placeholder="+91 9876543210" className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-gray-700 outline-none placeholder:text-gray-400" />
                </div>
                {!fixedRole && (
                   <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">User Role</label>
                    <select value={formData.user_type} onChange={e => update('user_type', e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-gray-700 outline-none">
                      {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Practice Area</label>
                  <input value={formData.practice_area} onChange={e => update('practice_area', e.target.value)} placeholder="e.g. Criminal Law" className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-gray-700 outline-none placeholder:text-gray-400" />
                </div>
                {['super_admin', 'partner_manager'].includes(formData.user_type) && (
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                      Associated Law Firm {formData.user_type === 'super_admin' && <span className="text-red-500">*</span>}
                    </label>
                    <select 
                      value={formData.firm} 
                      onChange={e => update('firm', e.target.value)} 
                      required={formData.user_type === 'super_admin'}
                      className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-gray-700 outline-none"
                    >
                      <option value="">Select a firm...</option>
                      {firms.map((f: any) => (
                        <option key={f.id} value={f.id}>{f.firm_name}</option>
                      ))}
                    </select>
                    <p className="mt-1.5 text-xs text-gray-400">
                      {formData.user_type === 'super_admin' 
                        ? 'A Super Admin must be linked to a law firm.' 
                        : 'Link this partner manager to a specific law firm (optional).'}
                    </p>
                  </div>
                )}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Temporary Password</label>
                  <input type="password" value={formData.password} onChange={e => update('password', e.target.value)} required placeholder="••••••••" className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-gray-700 outline-none placeholder:text-gray-400" />
                </div>
              </div>
              {error && <p className="mt-4 text-xs font-semibold text-red-500">{error}</p>}
            </Panel>
          }
          right={
            <div className="space-y-6">
              <InfoAside accent={accent} title="Creation Notes" items={['New users will receive a verification email.', 'They must use the temporary password for first login.', 'Access scope is limited by the selected role.']} />
              <Panel title="Actions" subtitle="Onboard team member">
                 <div className="flex flex-col gap-3">
                    <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0e2340] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a3a5c] disabled:opacity-50">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Team Member
                    </button>
                    <button type="button" onClick={() => router.back()} className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                      <X className="h-4 w-4" /> Cancel
                    </button>
                 </div>
              </Panel>
            </div>
          }
        />
      </form>
    </div>
  );
}

export function ClientsPage({ accent, viewBase, role }: AccentProps & { viewBase?: string; role?: string }) {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await customFetch(API.USERS.LIST);
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.detail || 'Failed to fetch clients');
        
        let results = data.results || data;
        if (role) {
          results = results.filter((u: any) => u.user_type === role);
        }
        setClients(results);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [role]);

  const rows = clients.map((u, i) => ({
    client: `${u.first_name} ${u.last_name}`,
    matter: 'N/A', // Linking to real matters would require another API call or field
    phone: u.phone_number,
    email: u.email,
    status: u.is_active ? 'Active' : 'Inactive',
    viewHref: viewBase ? `${viewBase}/${u.id}` : undefined,
  }));

  return (
    <div className="space-y-8">
      <PageSection 
        eyebrow="Client Management" 
        title="Client Directory" 
        description="Register and manage client records tied to firm matters." 
        actions={<ActionLink href={`${viewBase}/new`} label="Register Client" />} 
      />
      <MetricGrid accent={accent} metrics={[{ label: 'Total Clients', value: clients.length.toString() }, { label: 'Active', value: clients.filter(c => c.is_active).length.toString() }, { label: 'Pending Docs', value: '0' }, { label: 'New This Month', value: '0' }]} />
      <Panel title="Client Register" subtitle="Current clients, lead matters, and contact status." actions={<SearchBar placeholder="Search clients, phone, or matter..." />}>
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="mt-4 text-sm text-gray-400">Loading clients...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100">
            <p className="text-sm font-medium">Error: {error}</p>
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'client', label: 'Client' },
              { key: 'matter', label: 'Lead Matter' },
              { key: 'phone', label: 'Phone' },
              { key: 'email', label: 'Email' },
              { key: 'status', label: 'Status' },
            ]}
            rows={rows}
          />
        )}
      </Panel>
    </div>
  );
}

export function ClientFormPage({ accent, detail }: AccentProps & { detail?: boolean }) {
  return (
    <div className="space-y-8">
      <PageSection eyebrow="Client" title={detail ? 'Client Profile' : 'Register Client'} description={detail ? 'Contact details, linked matters, and notes.' : 'Capture contact information, intake notes, and client preferences.'} />
      <SplitPanels
        left={<Panel title={detail ? 'Client Details' : 'Client Form'} subtitle="Client profile and relationship data."><FormGrid fields={clientFields} /></Panel>}
        right={<InfoAside accent={accent} title="Linked Records" items={['Case links remain attached to the client master record.', 'Email and phone verification remain placeholder states in this phase.', 'Billing and document access derive from linked matters.']} />}
      />
    </div>
  );
}

export function ReportsPage({ accent }: AccentProps) {
  return (
    <div className="space-y-8">
      <PageSection eyebrow="Reports" title="Reporting Hub" description="Generate firm performance, case status, workload, and billing reports." />
      <div className="grid gap-6 md:grid-cols-2">
        {reportCards.map((card) => (
          <Panel key={card.label} title={card.label} subtitle={card.value}>
            <div className="flex items-center justify-between rounded-xl bg-[#f7f8fa] p-4">
              <p className="text-sm text-gray-600">Mock filter and export controls will live here.</p>
              <button className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700">Generate</button>
            </div>
          </Panel>
        ))}
      </div>
      <InfoAside accent={accent} title="Report Inputs" items={['Date range and practice-area filters', 'Assigned advocate or team workload selection', 'Billing status and realization filters']} />
    </div>
  );
}

export function DocumentLibraryPage({ accent, roleTitle, viewBase }: AccentProps & { roleTitle: string; viewBase?: string }) {
  return (
    <div className="space-y-8">
      <PageSection eyebrow="Documents" title={`${roleTitle} Document Library`} description="Browse document types, version history, and upload ownership." />
      <SplitPanels
        left={<Panel title="Document Register" subtitle="FIR, petitions, evidence, orders, agreements, and affidavits."><DocumentHistory rows={documentRows} viewBase={viewBase} /></Panel>}
        right={<InfoAside accent={accent} title="Library Notes" items={['Each document captures upload date and uploader identity.', 'Version history is visible for review and audit.', 'Document type filters are represented in this mock through grouped rows.']} />}
      />
    </div>
  );
}

export function DocumentDetailPage({ accent, roleTitle }: AccentProps & { roleTitle: string }) {
  return (
    <div className="space-y-8">
      <PageSection eyebrow="Document Detail" title={`${roleTitle} Document Detail`} description="Review the selected document, version history, upload ownership, and linked matter context." />
      <SplitPanels
        left={
          <Panel title="Document Overview" subtitle="Metadata, version state, and linked case context.">
            <DetailList
              items={[
                { label: 'Document Name', value: 'FIR Copy' },
                { label: 'Type', value: 'FIR' },
                { label: 'Current Version', value: 'v2' },
                { label: 'Uploaded By', value: 'A. Sharma' },
                { label: 'Uploaded On', value: '12 Mar 2026' },
                { label: 'Linked Matter', value: 'State vs Mehta' },
              ]}
              columns={2}
            />
          </Panel>
        }
        right={
          <InfoAside
            accent={accent}
            title="Version Notes"
            items={[
              'Version lineage and uploader history are visible for audit review.',
              'Download, share, and annotation actions can attach here later.',
              'Client routes stay read-only while internal roles can layer review actions.',
            ]}
          />
        }
      />
    </div>
  );
}

export function DraftsPage({ accent, roleTitle, approvalMode, viewBase }: AccentProps & { roleTitle: string; approvalMode?: boolean; viewBase?: string }) {
  return (
    <div className="space-y-8">
      <PageSection eyebrow="Drafting" title={`${roleTitle} Draft Workspace`} description={approvalMode ? 'Review draft submissions, approval state, and revision history.' : 'Draft petitions and supporting legal documents for assigned matters.'} />
      <SplitPanels
        left={
          <Panel title="Draft Queue" subtitle="Draft status, linked case, and current revision state.">
            <DataTable
              columns={[
                { key: 'draft', label: 'Draft' },
                { key: 'matter', label: 'Matter' },
                { key: 'owner', label: 'Owner' },
                { key: 'status', label: 'Status' },
                { key: 'updated', label: 'Updated' },
              ]}
              rows={[
                { draft: 'Bail Petition v4', matter: 'State vs Mehta', owner: 'Ritika Iyer', status: approvalMode ? 'Awaiting approval' : 'In progress', updated: 'Today', viewHref: viewBase ? `${viewBase}/1` : undefined },
                { draft: 'Evidence Synopsis v2', matter: 'Apex Traders Arbitration', owner: 'S. Nair', status: 'Needs revision', updated: 'Yesterday', viewHref: viewBase ? `${viewBase}/2` : undefined },
              ]}
            />
          </Panel>
        }
        right={<InfoAside accent={accent} title="Draft Controls" items={approvalMode ? ['Approve or return advocate drafts.', 'Track revision history and version lineage.', 'Link draft status to case lifecycle timeline.'] : ['Rich-text editor shell reserved for petition drafting.', 'Final approval remains restricted by role.', 'Draft actions will later connect to document storage and collaboration.']} />}
      />
    </div>
  );
}

export function DraftDetailPage({ accent, roleTitle }: AccentProps & { roleTitle: string }) {
  return (
    <div className="space-y-8">
      <PageSection eyebrow="Draft Detail" title={`${roleTitle} Draft Detail`} description="Review the selected draft, revision notes, and approval history." />
      <SplitPanels
        left={<Panel title="Draft Summary" subtitle="Current status, linked matter, and revision notes."><ActivityFeed items={activityRows} /></Panel>}
        right={<InfoAside accent={accent} title="Editor Placeholder" items={['Rich-text drafting area will sit here.', 'Version compare and approval history are represented in the activity feed.', 'Linked matter context remains visible beside draft actions.']} />}
      />
    </div>
  );
}

export function InvoicesPage({ accent, roleTitle, viewBase }: AccentProps & { roleTitle: string; viewBase?: string }) {
  return (
    <div className="space-y-8">
      <PageSection eyebrow="Invoices" title={`${roleTitle} Invoice Center`} description="Review invoice status, payment collection, and follow-up actions." />
      <MetricGrid accent={accent} metrics={invoiceRows} />
      <Panel title="Invoice Register" subtitle="Matter-linked billing records">
        <DataTable
          columns={[
            { key: 'invoice', label: 'Invoice' },
            { key: 'matter', label: 'Matter' },
            { key: 'client', label: 'Client' },
            { key: 'amount', label: 'Amount' },
            { key: 'status', label: 'Status' },
          ]}
          rows={[
            { invoice: 'INV-2041', matter: 'State vs Mehta', client: 'Amit Mehta', amount: 'Rs. 84,000', status: 'Pending', viewHref: viewBase ? `${viewBase}/2041` : undefined },
            { invoice: 'INV-2044', matter: 'Property Appeal', client: 'Nisha Kapoor', amount: 'Rs. 41,000', status: 'Paid', viewHref: viewBase ? `${viewBase}/2044` : undefined },
          ]}
        />
      </Panel>
    </div>
  );
}

export function InvoiceDetailPage({ accent, roleTitle }: AccentProps & { roleTitle: string }) {
  return (
    <div className="space-y-8">
      <PageSection eyebrow="Invoice Detail" title={`${roleTitle} Invoice Detail`} description="Matter-linked invoice summary, payment state, and reminder history." />
      <SplitPanels
        left={<Panel title="Invoice Overview" subtitle="Amounts, billing type, and payment history."><DetailList items={[{ label: 'Invoice Number', value: 'INV-2041' }, { label: 'Matter', value: 'State vs Mehta' }, { label: 'Billing Type', value: 'Fixed Fee' }, { label: 'Advance Paid', value: 'Rs. 1,00,000' }, { label: 'Pending', value: 'Rs. 84,000' }, { label: 'Status', value: <Badge label="Pending" tone="warning" /> }]} columns={2} /></Panel>}
        right={<InfoAside accent={accent} title="Collection Notes" items={['Reminder history and payment follow-ups live here.', 'Later integration point for payment receipts and gateway callbacks.', 'Client-facing status remains simplified on client routes.']} />}
      />
    </div>
  );
}

export function MessagingPage({ accent, roleTitle, clientVisible }: AccentProps & { roleTitle: string; clientVisible?: boolean }) {
  return (
    <div className="space-y-8">
      <PageSection eyebrow="Messaging" title={`${roleTitle} Messaging`} description={clientVisible ? 'Simplified message thread for secure client communication.' : 'Internal and client messaging shell for case coordination.'} />
      <SplitPanels
        left={<Panel title="Conversation List" subtitle="Recent case-linked threads."><ActivityFeed items={[{ actor: 'Amit Mehta', action: 'asked for the next hearing update.', time: 'Today, 10:30 AM' }, { actor: 'Ritika Iyer', action: 'shared a draft review request with admin.', time: 'Yesterday, 6:00 PM' }]} /></Panel>}
        right={<InfoAside accent={accent} title="Message Panel" items={clientVisible ? ['Client messaging stays limited to approved channels.', 'No direct case edits from this screen.'] : ['Chat-like interface placeholder for matter-linked conversations.', 'Attachments, templates, and escalation states can be layered in later.']} />}
      />
    </div>
  );
}

export function CalendarPage({ accent, roleTitle }: AccentProps & { roleTitle: string }) {
  return (
    <div className="space-y-8">
      <PageSection eyebrow="Calendar" title={`${roleTitle} Calendar and Deadlines`} description="Track hearings, filing deadlines, internal tasks, and reminder windows." />
      <MetricGrid accent={accent} metrics={[{ label: 'Hearings This Week', value: '3' }, { label: 'Deadlines', value: '7' }, { label: 'Same-Day Alerts', value: '2' }, { label: 'Overdue Items', value: '1' }]} />
      <SplitPanels
        left={<Panel title="Upcoming Schedule" subtitle="Daily, weekly, and monthly agenda placeholders."><ActivityFeed items={[{ actor: '31 Mar 2026', action: 'Hearing: State vs Mehta at Sessions Court.', time: '10:30 AM' }, { actor: '02 Apr 2026', action: 'Deadline: Evidence synopsis filing.', time: '5:00 PM' }, { actor: '04 Apr 2026', action: 'Internal prep: witness brief review.', time: '2:30 PM' }]} /></Panel>}
        right={<InfoAside accent={accent} title="Reminder Rules" items={['7-day, 3-day, 1-day, same-day, and overdue alerts.', 'Escalation to admin reserved for critical missed deadlines.', 'eCourts sync remains supportive only; local records stay source of truth.']} />}
      />
    </div>
  );
}

export function ChangePasswordPanel({ accent }: AccentProps) {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await customFetch(API.USERS.CHANGE_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.detail || (typeof data === 'object' ? Object.values(data)[0] : 'Failed to change password'));
      }

      setSuccess('Password changed successfully');
      setFormData({ old_password: '', new_password: '', new_password_confirm: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Panel title="Change Password" subtitle="Security update for your login credentials.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Old Password</label>
          <input 
            type="password" 
            value={formData.old_password} 
            onChange={e => setFormData({ ...formData, old_password: e.target.value })}
            required 
            autoComplete="current-password"
            className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-black font-semibold outline-none" 
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">New Password</label>
            <input 
              type="password" 
              value={formData.new_password} 
              onChange={e => setFormData({ ...formData, new_password: e.target.value })}
              required 
              autoComplete="new-password"
              className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-black font-semibold outline-none" 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Confirm New Password</label>
            <input 
              type="password" 
              value={formData.new_password_confirm} 
              onChange={e => setFormData({ ...formData, new_password_confirm: e.target.value })}
              required 
              autoComplete="new-password"
              className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-black font-semibold outline-none" 
            />
          </div>
        </div>
        {error && <p className="text-xs font-semibold text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
        {success && <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">{success}</p>}
        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-[#0e2340] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
            style={{ backgroundColor: accent }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </Panel>
  );
}

export function ProfileInformationPanel({ accent }: AccentProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    date_of_birth: '',
    aadhar_number: '',
    pan_number: '',
    address_line_1: '',
    city: '',
    state: '',
    country: 'India',
    postal_code: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const details = localStorage.getItem('user_details');
    if (details) {
      try {
        const user = JSON.parse(details);
        setUserId(user.id);
        setFormData(prev => ({
          ...prev,
          first_name: user.first_name || '',
          date_of_birth: user.date_of_birth || '',
          aadhar_number: user.aadhar_number || '',
          pan_number: user.pan_number || '',
          address_line_1: user.address_line_1 || '',
          city: user.city || '',
          state: user.state || '',
          country: user.country || 'India',
          postal_code: user.postal_code || '',
        }));
      } catch (e) {
        console.error('Error parsing user_details:', e);
      }
    }
    setFetching(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError('User session not found. Please log in again.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await customFetch(API.USERS.DETAIL(userId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.detail || (typeof data === 'object' ? Object.values(data)[0] : 'Failed to update profile'));
      }

      setSuccess('Profile updated successfully');
      localStorage.setItem('user_details', JSON.stringify(data));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (k: string, v: string) => {
    setFormData(p => ({ ...p, [k]: v }));
    setError('');
    setSuccess('');
  };

  if (fetching) return <div className="p-8 text-center text-sm text-gray-400 font-medium">Loading profile...</div>;

  return (
    <Panel title="Profile Information" subtitle="Update your personal details and identity information.">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">First Name</label>
            <input 
              type="text" 
              value={formData.first_name} 
              onChange={e => updateField('first_name', e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-black font-semibold outline-none" 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Date of Birth</label>
            <input 
              type="date" 
              value={formData.date_of_birth} 
              onChange={e => updateField('date_of_birth', e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-black font-semibold outline-none" 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Aadhar Number</label>
            <input 
              type="text" 
              value={formData.aadhar_number} 
              onChange={e => updateField('aadhar_number', e.target.value)}
              maxLength={12}
              placeholder="12-digit Aadhar"
              className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-black font-semibold outline-none" 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">PAN Number</label>
            <input 
              type="text" 
              value={formData.pan_number} 
              onChange={e => updateField('pan_number', e.target.value)}
              maxLength={10}
              placeholder="ABCDE1234F"
              className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-black font-semibold outline-none" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Address Line 1</label>
            <input 
              type="text" 
              value={formData.address_line_1} 
              onChange={e => updateField('address_line_1', e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-black font-semibold outline-none" 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">City</label>
            <input 
              type="text" 
              value={formData.city} 
              onChange={e => updateField('city', e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-black font-semibold outline-none" 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">State</label>
            <input 
              type="text" 
              value={formData.state} 
              onChange={e => updateField('state', e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-black font-semibold outline-none" 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Country</label>
            <input 
              type="text" 
              value={formData.country} 
              onChange={e => updateField('country', e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-black font-semibold outline-none" 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Postal Code</label>
            <input 
              type="text" 
              value={formData.postal_code} 
              onChange={e => updateField('postal_code', e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f8fa] px-3.5 text-sm text-black font-semibold outline-none" 
            />
          </div>
        </div>

        {error && <p className="text-xs font-semibold text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
        {success && <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">{success}</p>}

        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-[#0e2340] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
            style={{ backgroundColor: accent }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Panel>
  );
}

export function NotFoundPage({
  title,
  body,
  href,
  label,
}: {
  title: string;
  body: string;
  href: string;
  label: string;
}) {
  return <RecoveryCard title={title} body={body} href={href} label={label} />;
}

export const roleIcons = {
  platform: Building2,
  cases: Briefcase,
  documents: FileText,
  billing: CreditCard,
  reports: Activity,
  drafting: PenTool,
  messages: MessageSquare,
  calendar: Calendar,
  team: Users,
  settings: ShieldCheck,
  court: Gavel,
  tasks: CheckSquare,
};
