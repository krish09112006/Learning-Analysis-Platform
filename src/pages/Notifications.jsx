import React from 'react';

export default function Notifications() {
  return (
    <div className="p-8 animate-fade-in">
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '16px' }}>Notifications</h2>
      <p style={{ color: 'var(--text-muted)' }}>View course announcements and system alerts. (Integration coming soon)</p>
    </div>
  );
}
