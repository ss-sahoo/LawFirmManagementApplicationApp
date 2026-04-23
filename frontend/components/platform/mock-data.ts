export const caseTimeline = [
  { title: 'Case created', subtitle: 'Matter opened by Super Admin on 12 Mar 2026', tone: 'info' as const },
  { title: 'FIR uploaded and OCR parsed', subtitle: 'Applicable acts suggested: IPC 420, CrPC 154', tone: 'success' as const },
  { title: 'Filed before Sessions Court', subtitle: 'Filing confirmed on 18 Mar 2026', tone: 'default' as const },
  { title: 'Hearing 1 completed', subtitle: 'Adjourned for evidence review on 24 Mar 2026', tone: 'warning' as const },
  { title: 'Evidence stage in progress', subtitle: 'Senior advocate requested transfer notes', tone: 'danger' as const },
];

export const documentRows = [
  { name: 'FIR Copy', type: 'FIR', version: 'v2', uploadedBy: 'A. Sharma', date: '12 Mar 2026' },
  { name: 'Bail Petition Draft', type: 'Petition', version: 'v4', uploadedBy: 'R. Iyer', date: '18 Mar 2026' },
  { name: 'Evidence Bundle A', type: 'Evidence', version: 'v1', uploadedBy: 'S. Nair', date: '22 Mar 2026' },
  { name: 'Interim Order', type: 'Court Order', version: 'v1', uploadedBy: 'Court Clerk', date: '24 Mar 2026' },
];

export const activityRows = [
  { actor: 'Ritika Iyer', action: 'uploaded a revised petition draft for partner review.', time: 'Today, 11:20 AM' },
  { actor: 'Arjun Sharma', action: 'confirmed hearing notes and marked next deadline.', time: 'Today, 9:15 AM' },
  { actor: 'System OCR', action: 'extracted 14 key fields from FIR and suggested acts.', time: 'Yesterday, 7:40 PM' },
];

export const hearingRows = [
  { label: 'Upcoming hearing', value: '31 Mar 2026, Courtroom 4' },
  { label: 'Judge remarks', value: 'Submit evidence synopsis and witness list.' },
  { label: 'Adjournments', value: '2 total in current matter lifecycle' },
  { label: 'Bench', value: 'Hon. Justice N. Rao' },
];

export const invoiceRows = [
  { label: 'Open invoices', value: '6' },
  { label: 'Pending amount', value: 'Rs. 1,84,000' },
  { label: 'Paid this month', value: 'Rs. 4,52,000' },
  { label: 'Overdue follow-ups', value: '3 reminders due' },
];

export const caseFormFields = [
  { label: 'Case Title', placeholder: 'State vs. Mehta' },
  { label: 'Case Number', placeholder: 'CRL-2026-1042' },
  { label: 'Applicable Act(s)', placeholder: 'IPC 420, CrPC 154' },
  { label: 'Case Type', placeholder: 'Criminal' },
  { label: 'Case Category', placeholder: 'Fraud Investigation' },
  { label: 'Court Name', placeholder: 'Sessions Court' },
  { label: 'Court Location', placeholder: 'Mumbai' },
  { label: 'Filing Date', placeholder: '2026-03-12', type: 'date' },
  { label: 'Case Status', placeholder: 'Active' },
  { label: 'Client Name', placeholder: 'Select or create client' },
  { label: 'Client Contact Number', placeholder: '+91 98XXXXXX45' },
  { label: 'Client Email', placeholder: 'client@example.com', type: 'email' },
  { label: 'Opponent Name', placeholder: 'Apex Traders Pvt Ltd' },
  { label: 'Opponent Advocate', placeholder: 'Neha Kamat' },
  { label: 'Assign Advocate', placeholder: 'Ritika Iyer' },
  { label: 'Assign Paralegal(s)', placeholder: 'S. Nair, V. Deshmukh' },
  { label: 'Priority', placeholder: 'High' },
  { label: 'Next Hearing Date', placeholder: '2026-03-31', type: 'date' },
  { label: 'Case Fees', placeholder: '350000', type: 'number' },
  { label: 'Billing Type', placeholder: 'Fixed' },
  { label: 'Advance Paid', placeholder: '100000', type: 'number' },
  { label: 'Case Summary', placeholder: 'Detailed summary of facts, legal issues, and filing context.', type: 'textarea', wide: true },
  { label: 'Internal Notes', placeholder: 'Internal remarks visible to firm team only.', type: 'textarea', wide: true },
];

export const teamFields = [
  { label: 'Full Name', placeholder: 'Ritika Iyer' },
  { label: 'Role', placeholder: 'Advocate' },
  { label: 'Email', placeholder: 'ritika@firm.com', type: 'email' },
  { label: 'Phone', placeholder: '+91 98XXXXXX45' },
  { label: 'Member Type', placeholder: 'Litigation' },
  { label: 'Reporting To', placeholder: 'Super Admin' },
];

export const clientFields = [
  { label: 'Client Name', placeholder: 'Amit Mehta' },
  { label: 'Phone Number', placeholder: '+91 99XXXXXX12' },
  { label: 'Email', placeholder: 'amit@example.com', type: 'email' },
  { label: 'Preferred Contact Mode', placeholder: 'Email + Phone' },
  { label: 'Address', placeholder: 'Full residential or office address', type: 'textarea', wide: true },
  { label: 'Matter Notes', placeholder: 'Sensitive intake notes and relationship context.', type: 'textarea', wide: true },
];

export const reportCards = [
  { label: 'Case Status Report', value: 'Running vs disposed vs closed matters' },
  { label: 'Advocate Workload', value: 'Assignments, deadlines, and hearing density' },
  { label: 'Billing Realization', value: 'Invoices, collections, overdue balances' },
  { label: 'Client Intake Report', value: 'New clients, active matters, practice-area mix' },
];

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'hearing' | 'task' | 'deadline' | 'meeting';
  caseNumber?: string;
  clientName?: string;
  role?: string;
  adminName?: string;
}

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Dr H S Ramya vs State of K...', date: new Date(2026, 3, 1), time: '10 AM', type: 'hearing', caseNumber: 'CC 409/2023', adminName: 'Admin', role: 'Litigation' },
  { id: '2', title: 'Dr H S Ramya vs State of K...', date: new Date(2026, 3, 8), time: '10 AM', type: 'hearing', caseNumber: 'CC 409/2023', adminName: 'Admin', role: 'Litigation' },
  { id: '3', title: 'Case of melvin mathew', date: new Date(2026, 3, 12), time: '11 AM', type: 'meeting', caseNumber: 'CC 102/2026', clientName: 'Melvin', adminName: 'Admin', role: 'Pre-Litigation' },
  
  // April 22nd Detailed Events
  { id: '101', title: 'MOHAMMED NIZAM vs KUNAL BHATT', date: new Date(2026, 3, 22), time: '9 AM', type: 'deadline', clientName: 'MOHAMMED NIZAM', role: 'Litigation', adminName: 'Admin' },
  { id: '102', title: 'Cr.No 375/2025 — North East PS vs Madhavi Lakshmi', date: new Date(2026, 3, 22), time: '10 AM', type: 'hearing', clientName: 'Madhavi', role: 'Litigation', adminName: 'Admin' },
  { id: '103', title: 'CC 409/2023 — RAKESH vs JITHEDRAN', date: new Date(2026, 3, 22), time: '11 AM', type: 'hearing', role: 'Litigation', adminName: 'Admin' },
  { id: '104', title: 'Case of Anand', date: new Date(2026, 3, 22), time: '1 PM', type: 'task', clientName: 'Anand', role: 'Pre-Litigation', adminName: 'Adv. Shiva Shankar' },
  { id: '105', title: 'Case of Test', date: new Date(2026, 3, 22), time: '2 PM', type: 'task', clientName: 'Test', role: 'Pre-Litigation', adminName: 'Admin' },
  { id: '106', title: 'Case of Sushree Mithali', date: new Date(2026, 3, 22), time: '3 PM', type: 'task', clientName: 'Sushree Mithali', role: 'Pre-Litigation', adminName: 'Admin' },
  { id: '107', title: 'Case of Madhusudhan roa', date: new Date(2026, 3, 22), time: '4 PM', type: 'task', clientName: 'Madhusudhan roa', role: 'Pre-Litigation', adminName: 'Adv. Chaturya' },
  { id: '108', title: 'Case of Jayanthi K', date: new Date(2026, 3, 22), time: '5 PM', type: 'task', role: 'Pre-Litigation', adminName: 'Admin' },
];

export const CLIENT_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: 'c1', title: 'Hearing for Your Case: Dr H S Ramya', date: new Date(2026, 3, 8), time: '10 AM', type: 'hearing', caseNumber: 'CC 409/2023', adminName: 'Admin', role: 'Litigation' },
  { id: 'c2', title: 'Document Submission Deadline', date: new Date(2026, 3, 15), time: '5 PM', type: 'deadline', adminName: 'Admin' },
  { id: 'c3', title: 'Meeting with Advocate Shiva Shankar', date: new Date(2026, 3, 22), time: '1 PM', type: 'meeting', adminName: 'Adv. Shiva Shankar' },
];

export const MOCK_PROFESSIONAL_INVOICES = [
  { id: 'INV-4401', client: 'Amit Mehta', matter: 'Mehta vs. State', amount: 'Rs. 45,000', status: 'paid' as const, date: '2026-04-12', due: '2026-04-15' },
  { id: 'INV-4402', client: 'Chen & Associates', matter: 'Civil Appeal 22', amount: 'Rs. 1,20,000', status: 'pending' as const, date: '2026-04-18', due: '2026-04-25' },
  { id: 'INV-4403', client: 'Torres Law Group', amount: 'Rs. 85,000', status: 'overdue' as const, date: '2026-04-05', due: '2026-04-12' },
  { id: 'INV-4404', client: 'Sarah Chen', amount: 'Rs. 32,500', status: 'draft' as const, date: '2026-04-21', due: '2026-04-28' },
];

export const ADMIN_CALENDAR_EVENTS: CalendarEvent[] = [
  ...MOCK_CALENDAR_EVENTS,
  { id: 'a1', title: 'Firm-Wide Partners Meeting', date: new Date(2026, 3, 25), time: '2 PM', type: 'meeting', adminName: 'Super Admin' },
  { id: 'a2', title: 'Platform Maintenance Window', date: new Date(2026, 3, 28), time: '12 AM', type: 'task', adminName: 'System' },
];
