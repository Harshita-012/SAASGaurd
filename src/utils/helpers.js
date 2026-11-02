// Utility helpers for SaaSGuard

export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getMonthlyCost = (subscription) => {
  if (!subscription) return 0;
  const cost = parseFloat(subscription.cost) || 0;
  return subscription.billingCycle === 'Annually' ? cost / 12 : cost;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const getDaysRemaining = (targetDateStr) => {
  if (!targetDateStr) return 0;
  const now = new Date('2026-11-02'); // Anchor to mock current date
  const target = new Date(targetDateStr);
  const diffTime = target - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getDaysInactive = (lastActiveDateStr) => {
  if (!lastActiveDateStr) return 999;
  const now = new Date('2026-11-02'); // Anchor to mock current date
  const last = new Date(lastActiveDateStr);
  const diffTime = now - last;
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
};

// Generates an exportable CSV string from subscriptions
export const exportSubscriptionsToCSV = (subscriptions) => {
  const headers = [
    'ID',
    'Application Name',
    'Vendor',
    'Category',
    'Billing Cycle',
    'Cost',
    'Monthly Equivalent',
    'Currency',
    'Total Licences',
    'Assigned Licences',
    'Renewal Date',
    'Status',
    'Owner',
    'Notes',
  ];

  const rows = subscriptions.map((sub) => [
    sub.id,
    `"${(sub.applicationName || '').replace(/"/g, '""')}"`,
    `"${(sub.vendor || '').replace(/"/g, '""')}"`,
    `"${(sub.category || '').replace(/"/g, '""')}"`,
    sub.billingCycle,
    sub.cost,
    Math.round(getMonthlyCost(sub)),
    sub.currency,
    sub.totalLicences,
    sub.assignedLicences,
    sub.renewalDate,
    sub.status,
    `"${(sub.owner || '').replace(/"/g, '""')}"`,
    `"${(sub.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
};

// Simple CSV parser
export const parseCSVToSubscriptions = (csvText) => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));
  const parsed = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle quoted columns with commas
    const cols = [];
    let inQuotes = false;
    let current = '';

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"' && (c === 0 || line[c - 1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cols.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    cols.push(current.trim());

    const item = {
      id: `sub-${Date.now()}-${i}`,
      applicationName: cols[1] || cols[0] || 'Imported App',
      vendor: cols[2] || 'Various',
      category: cols[3] || 'General',
      billingCycle: cols[4]?.toLowerCase().includes('annual') ? 'Annually' : 'Monthly',
      cost: parseFloat(cols[5]) || 50,
      currency: 'USD',
      totalLicences: parseInt(cols[7] || cols[8], 10) || 1,
      assignedLicences: parseInt(cols[8] || cols[9], 10) || 0,
      renewalDate: cols[9] || '2026-12-31',
      status: 'Active',
      owner: cols[11] || 'Admin',
      notes: cols[12] || 'Imported via CSV',
    };

    parsed.push(item);
  }

  return parsed;
};
