'use client';

import React, { useState } from 'react';
import { PenLine, Award, ShieldCheck, Check, Upload, Save, Lock } from 'lucide-react';

export default function SignatureSetupsPage() {
  const [signatoryName, setSignatoryName] = useState('Dr. Abdullahi Warsame');
  const [signatoryTitle, setSignatoryTitle] = useState('Director of Examination & Academic Quality');
  const [organizationName, setOrganizationName] = useState('NetSom Exam Certification Authority');
  const [sealEnabled, setSealEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
          CERTIFICATION GOVERNANCE
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px', margin: '0 0 6px 0' }}>
          Signature & Stamp Setups
        </h1>
        <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
          Configure institutional authorization signatures, official accreditation seals, and verifiable credential signatories.
        </p>
      </div>

      {/* Main Settings Card */}
      <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Primary Signatory Full Name
            </label>
            <input
              type="text"
              required
              value={signatoryName}
              onChange={(e) => setSignatoryName(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Signatory Title / Designation
              </label>
              <input
                type="text"
                required
                value={signatoryTitle}
                onChange={(e) => setSignatoryTitle(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Accreditation Authority
              </label>
              <input
                type="text"
                required
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Digital Signature Specimen */}
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
              Digital Signature Specimen
            </label>
            <div
              style={{
                border: '2px dashed #CBD5E1',
                borderRadius: '14px',
                padding: '28px',
                textAlign: 'center',
                background: '#F8FAFC',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PenLine size={22} color="#0284C7" />
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                Upload Authorized Digital Signature (PNG with transparent background)
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                Recommended dimensions: 400x150px. Max file size: 2MB.
              </div>
            </div>
          </div>

          {/* Official Seal Switch */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldCheck size={20} color="#16A34A" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  Cryptographic Verification Seal
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  Stamp automated QR verification hash on all issued certificates.
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={sealEnabled}
              onChange={(e) => setSealEnabled(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0284C7' }}
            />
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            {saved && (
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#16A34A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={16} /> Signature configuration saved!
              </span>
            )}
            <button
              type="submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#0284C7',
                color: '#FFFFFF',
                padding: '10px 22px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(2,132,199,0.25)',
              }}
            >
              <Save size={15} /> Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
