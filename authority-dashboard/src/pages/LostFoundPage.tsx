import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { LostFoundReport } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { firebaseDashboardService } from '../services/firebaseService';
import {
  Search,
  Plus,
  MapPin,
  Eye,
  Camera,
  Upload,
  X,
  User,
  Image as ImageIcon,
  CheckCircle2,
  ZoomIn,
  Sparkles,
  Scan,
} from 'lucide-react';
import { LiveFaceDetectionModal } from '../components/camera/LiveFaceDetectionModal';
import { faceService } from '../services/faceService';

// Preset high-fidelity SVG avatars for instant demo testing
export const PRESET_AVATARS = {
  elderlyMale: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <defs>
        <radialGradient id="bg1" cx="50%" cy="30%" r="80%">
          <stop offset="0%" stop-color="#FEF3C7"/>
          <stop offset="100%" stop-color="#FDE68A"/>
        </radialGradient>
      </defs>
      <rect width="160" height="160" rx="16" fill="url(#bg1)"/>
      <circle cx="80" cy="65" r="32" fill="#FDDCB5"/>
      <!-- White hair & beard -->
      <path d="M48 65 C48 35 112 35 112 65 C112 52 48 52 48 65 Z" fill="#E2E8F0"/>
      <path d="M56 78 C56 108 104 108 104 78 C94 92 66 92 56 78 Z" fill="#F1F5F9"/>
      <!-- Eyes & Spectacles -->
      <circle cx="68" cy="64" r="7" fill="none" stroke="#64748B" stroke-width="2.5"/>
      <circle cx="92" cy="64" r="7" fill="none" stroke="#64748B" stroke-width="2.5"/>
      <line x1="75" y1="64" x2="85" y2="64" stroke="#64748B" stroke-width="2.5"/>
      <circle cx="68" cy="64" r="2.5" fill="#0F172A"/>
      <circle cx="92" cy="64" r="2.5" fill="#0F172A"/>
      <!-- Saffron Tilak -->
      <rect x="78" y="44" width="4" height="12" rx="2" fill="#F47C20"/>
      <circle cx="80" cy="58" r="2" fill="#DC2626"/>
      <!-- Saffron Kurta -->
      <path d="M30 160 C30 115 130 115 130 160 Z" fill="#F47C20"/>
      <path d="M68 120 L80 138 L92 120 Z" fill="#FDDCB5"/>
      <line x1="80" y1="138" x2="80" y2="160" stroke="#C2410C" stroke-width="3"/>
    </svg>
  `)}`,
  elderlyFemale: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <defs>
        <radialGradient id="bg2" cx="50%" cy="30%" r="80%">
          <stop offset="0%" stop-color="#FCE7F3"/>
          <stop offset="100%" stop-color="#FBCFE8"/>
        </radialGradient>
      </defs>
      <rect width="160" height="160" rx="16" fill="url(#bg2)"/>
      <!-- Grey Bun -->
      <circle cx="80" cy="40" r="16" fill="#94A3B8"/>
      <circle cx="80" cy="68" r="30" fill="#FCD3B1"/>
      <path d="M50 68 C50 38 110 38 110 68 C104 54 56 54 50 68 Z" fill="#CBD5E1"/>
      <!-- Red Bindi -->
      <circle cx="80" cy="58" r="3" fill="#DC2626"/>
      <!-- Eyes & Smile -->
      <ellipse cx="68" cy="68" rx="2.5" ry="3.5" fill="#1E293B"/>
      <ellipse cx="92" cy="68" rx="2.5" ry="3.5" fill="#1E293B"/>
      <path d="M72 82 Q80 88 88 82" stroke="#B45309" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- Green Saree with Gold border -->
      <path d="M30 160 C30 115 130 115 130 160 Z" fill="#15803D"/>
      <path d="M40 160 L75 118 L95 125 L65 160 Z" fill="#F59E0B"/>
    </svg>
  `)}`,
  child: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <defs>
        <radialGradient id="bg3" cx="50%" cy="30%" r="80%">
          <stop offset="0%" stop-color="#E0F2FE"/>
          <stop offset="100%" stop-color="#BAE6FD"/>
        </radialGradient>
      </defs>
      <rect width="160" height="160" rx="16" fill="url(#bg3)"/>
      <!-- Child face -->
      <circle cx="80" cy="66" r="28" fill="#FDE2C3"/>
      <!-- Black hair -->
      <path d="M52 62 C50 32 110 32 108 62 C100 48 60 48 52 62 Z" fill="#1E293B"/>
      <!-- Big cheerful eyes -->
      <circle cx="70" cy="65" r="4.5" fill="#0F172A"/>
      <circle cx="90" cy="65" r="4.5" fill="#0F172A"/>
      <circle cx="71.5" cy="63.5" r="1.5" fill="#FFFFFF"/>
      <circle cx="91.5" cy="63.5" r="1.5" fill="#FFFFFF"/>
      <!-- Bright smile -->
      <path d="M71 78 Q80 88 89 78" stroke="#DC2626" stroke-width="3" fill="#DC2626" stroke-linecap="round"/>
      <!-- Blue t-shirt -->
      <path d="M32 160 C32 116 128 116 128 160 Z" fill="#0284C7"/>
      <circle cx="80" cy="116" r="12" fill="#FDE2C3"/>
    </svg>
  `)}`,
  adultMale: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <defs>
        <radialGradient id="bg4" cx="50%" cy="30%" r="80%">
          <stop offset="0%" stop-color="#EDE9FE"/>
          <stop offset="100%" stop-color="#DDD6FE"/>
        </radialGradient>
      </defs>
      <rect width="160" height="160" rx="16" fill="url(#bg4)"/>
      <circle cx="80" cy="64" r="30" fill="#F5CBA7"/>
      <!-- Black Hair & Mustache -->
      <path d="M50 60 C48 30 112 30 110 60 C100 44 60 44 50 60 Z" fill="#1E1E24"/>
      <path d="M68 78 Q80 74 92 78 Q80 84 68 78 Z" fill="#1E1E24"/>
      <!-- Eyes & Red Tilak -->
      <circle cx="68" cy="62" r="3" fill="#1E293B"/>
      <circle cx="92" cy="62" r="3" fill="#1E293B"/>
      <line x1="80" y1="46" x2="80" y2="56" stroke="#DC2626" stroke-width="3" stroke-linecap="round"/>
      <!-- Maroon Kurta -->
      <path d="M30 160 C30 118 130 118 130 160 Z" fill="#991B1B"/>
      <path d="M70 120 L80 136 L90 120 Z" fill="#F5CBA7"/>
    </svg>
  `)}`,
};

const INITIAL_REPORTS: LostFoundReport[] = [
  {
    id: 'LF-2026-104',
    type: 'MISSING_PERSON',
    nameOrItem: 'Balkrishna Joshi (72 yrs)',
    ageOrDescription: 'Wearing saffron kurta, white dhoti, walking cane. Hindi & Marathi speaker.',
    lastKnownLocation: 'Gate 3 — North Ghat Steps',
    reportedTime: '20 minutes ago',
    contactNumber: '+91 94222 XXXXX',
    status: 'SEARCHING',
    assignedTeam: 'Zonal Patrol Team 4',
    photoUrl: PRESET_AVATARS.elderlyMale,
  },
  {
    id: 'LF-2026-103',
    type: 'FOUND_PERSON',
    nameOrItem: 'Rahul (Approx 6 yrs)',
    ageOrDescription: 'Blue t-shirt, grey shorts. Currently safe at Ramkund Child Welfare Kiosk.',
    lastKnownLocation: 'Ramkund Changing Pavilion',
    reportedTime: '35 minutes ago',
    contactNumber: 'Child Helpdesk Ext 12',
    status: 'MATCHED',
    assignedTeam: 'Child Welfare Squad 1',
    photoUrl: PRESET_AVATARS.child,
  },
  {
    id: 'LF-2026-102',
    type: 'LOST_ITEM',
    nameOrItem: 'Leather Pouch & Train Tickets',
    ageOrDescription: 'Brown leather pouch with Nashik-Mumbai train tickets and Aadhaar Card.',
    lastKnownLocation: 'Tapovan Bus Stand Terminal',
    reportedTime: '1 hour ago',
    contactNumber: '+91 98210 XXXXX',
    status: 'SEARCHING',
    assignedTeam: 'Station Lost Property Depot',
  },
  {
    id: 'LF-2026-101',
    type: 'MISSING_PERSON',
    nameOrItem: 'Kavita Devi (58 yrs)',
    ageOrDescription: 'Emerald green saree with gold border, separated during evening Ganga aarti.',
    lastKnownLocation: 'Kapaleshwar Mandir Queue',
    reportedTime: '3 hours ago',
    contactNumber: '+91 91580 XXXXX',
    status: 'RESOLVED',
    assignedTeam: 'Panchavati Police Team',
    photoUrl: PRESET_AVATARS.elderlyFemale,
  },
];

const STORAGE_KEY = 'ksa_lost_found_reports';

export const LostFoundPage: React.FC = () => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load persisted reports or fallback to initial
  const [reports, setReports] = useState<LostFoundReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_REPORTS;
  });

  const [tab, setTab] = useState<'MISSING' | 'FOUND' | 'MATCHED' | 'RESOLVED'>('MISSING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<LostFoundReport | null>(null);
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isFaceScanOpen, setIsFaceScanOpen] = useState(false);

  // AI Face Matching Modal states
  const [matchModalReport, setMatchModalReport] = useState<LostFoundReport | null>(null);
  const [matchTestImage, setMatchTestImage] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [isMatching, setIsMatching] = useState(false);
  const matchFileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLocation, setNewLocation] = useState('Gate 1 — Ramkund Area');
  const [newContact, setNewContact] = useState('');
  const [newType, setNewType] = useState<'MISSING_PERSON' | 'FOUND_PERSON' | 'LOST_ITEM'>('MISSING_PERSON');
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('');
  const [photoFileName, setPhotoFileName] = useState<string>('');

  // Persist reports whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    } catch {}
  }, [reports]);

  // Real-time Firestore sync with mobile app
  useEffect(() => {
    const unsubscribe = firebaseDashboardService.subscribeToLostFound((fbReports) => {
      if (fbReports && fbReports.length > 0) {
        setReports((prev) => {
          const map = new Map<string, LostFoundReport>();
          fbReports.forEach((r) => map.set(r.id, r));
          prev.forEach((r) => {
            if (!map.has(r.id)) map.set(r.id, r);
          });
          return Array.from(map.values());
        });
      }
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Handle file upload via FileReader
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Please choose an image under 5MB.');
        return;
      }
      setPhotoFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (url: string, label: string) => {
    setNewPhotoUrl(url);
    setPhotoFileName(`Preset: ${label}`);
  };

  const handleRemovePhoto = () => {
    setNewPhotoUrl('');
    setPhotoFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredReports = reports.filter((r) => {
    // Tab filter
    let tabMatch = true;
    if (tab === 'MISSING') tabMatch = r.type === 'MISSING_PERSON' && r.status !== 'RESOLVED';
    else if (tab === 'FOUND') tabMatch = (r.type === 'FOUND_PERSON' || r.type === 'FOUND_ITEM') && r.status !== 'RESOLVED';
    else if (tab === 'MATCHED') tabMatch = r.status === 'MATCHED';
    else if (tab === 'RESOLVED') tabMatch = r.status === 'RESOLVED';

    if (!tabMatch) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.nameOrItem.toLowerCase().includes(q) ||
        r.ageOrDescription.toLowerCase().includes(q) ||
        r.lastKnownLocation.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleUpdateStatus = (id: string, newStatus: 'PENDING' | 'SEARCHING' | 'MATCHED' | 'RESOLVED') => {
    try {
      firebaseDashboardService.updateLostFoundStatus(id, newStatus);
    } catch (_) {}

    // Synchronize case status with Face AI registry immediately
    try {
      faceService.updateCaseStatus(id, newStatus);
    } catch (_) {}

    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    if (selectedReport && selectedReport.id === id) {
      setSelectedReport({ ...selectedReport, status: newStatus });
    }
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: LostFoundReport = {
      id: `LF-2026-${Math.floor(105 + Math.random() * 500)}`,
      type: newType,
      nameOrItem: newTitle,
      ageOrDescription: newDesc,
      lastKnownLocation: newLocation,
      reportedTime: 'Just now',
      contactNumber: newContact.trim() || 'Control Room Registered',
      status: 'SEARCHING',
      assignedTeam: 'Zonal Patrol Team 1',
      photoUrl: newPhotoUrl || undefined,
    };

    // Broadcast to Firebase in real-time
    try {
      firebaseDashboardService.addLostFound(newEntry);
    } catch (_) {}

    // Automatically enroll face into backend AI registry if photo was provided
    if (newPhotoUrl) {
      faceService.registerPerson({
        name: newTitle.trim(),
        image: newPhotoUrl,
        person_id: newEntry.id,
        details: newDesc.trim(),
        location: newLocation.trim(),
        contact: newContact.trim(),
        type: newType,
      }).then(() => {
        console.log(`[FaceAI] Successfully enrolled ${newTitle} into optical recognition model.`);
      }).catch((err) => {
        console.warn('Face AI enrollment note:', err);
      });
    }

    setReports([newEntry, ...reports]);
    setIsAddOpen(false);
    // Reset form
    setNewTitle('');
    setNewDesc('');
    setNewContact('');
    setNewPhotoUrl('');
    setPhotoFileName('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            {t.lostFound.title}
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '2px' }}>
            {t.lostFound.subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsFaceScanOpen(true)}
            icon={<Scan size={16} color="#0284C7" />}
            style={{ border: '1.5px solid #BAE6FD', backgroundColor: '#F0F9FF', color: '#0369A1' }}
          >
            Scan Person Face (AI)
          </Button>

          <Button
            variant="saffron"
            size="md"
            onClick={() => setIsAddOpen(true)}
            icon={<Plus size={16} />}
            style={{ boxShadow: '0 2px 6px rgba(244, 124, 32, 0.3)' }}
          >
            {t.lostFound.fileNewReport}
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '6px',
            padding: '6px',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            width: 'fit-content',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          {[
            { id: 'MISSING', label: t.lostFound.tabMissing },
            { id: 'FOUND', label: t.lostFound.tabFound },
            { id: 'MATCHED', label: t.lostFound.tabMatched },
            { id: 'RESOLVED', label: t.lostFound.tabResolved },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as any)}
              style={{
                border: 'none',
                background: tab === item.id ? '#123B5D' : 'transparent',
                color: tab === item.id ? '#FFFFFF' : '#475569',
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
            padding: '7px 12px',
            width: '280px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <Search size={16} color="#64748B" />
          <input
            type="text"
            placeholder={`${t.common.search}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: '13px',
              width: '100%',
              color: '#0F172A',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0 }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Reports Table Card */}
      <Card padding="none">
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: '#F8FAFC',
                  borderBottom: '2px solid #E2E8F0',
                  color: '#475569',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                <th style={{ padding: '12px 16px', width: '64px' }}>{t.lostFound.colPhoto}</th>
                <th style={{ padding: '12px 16px' }}>{t.lostFound.colId}</th>
                <th style={{ padding: '12px 16px' }}>{t.lostFound.colName}</th>
                <th style={{ padding: '12px 16px' }}>{t.lostFound.colDesc}</th>
                <th style={{ padding: '12px 16px' }}>{t.lostFound.colLocation}</th>
                <th style={{ padding: '12px 16px' }}>{t.lostFound.colReported}</th>
                <th style={{ padding: '12px 16px' }}>{t.lostFound.colStatus}</th>
                <th style={{ padding: '12px 16px' }}>{t.lostFound.colTeam}</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>{t.lostFound.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Search size={28} color="#94A3B8" />
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>No reports matching this category or filter.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    {/* Photo Thumbnail */}
                    <td style={{ padding: '12px 16px' }}>
                      {report.photoUrl ? (
                        <div
                          onClick={() => setZoomedPhoto(report.photoUrl || null)}
                          title="Click to zoom photograph"
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: '2px solid #E2E8F0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#F1F5F9',
                          }}
                        >
                          <img
                            src={report.photoUrl}
                            alt={report.nameOrItem}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              backgroundColor: 'rgba(0,0,0,0.3)',
                              opacity: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'opacity 0.15s ease',
                              color: '#FFFFFF',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                          >
                            <ZoomIn size={14} />
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '10px',
                            backgroundColor: '#F1F5F9',
                            border: '1px dashed #CBD5E1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94A3B8',
                          }}
                          title={t.lostFound.noPhotoProvided}
                        >
                          <User size={18} />
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#123B5D' }}>{report.id}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0F172A' }}>{report.nameOrItem}</td>
                    <td style={{ padding: '14px 16px', color: '#475569', maxWidth: '240px' }}>
                      {report.ageOrDescription}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#334155' }}>
                        <MapPin size={13} color="#F47C20" />
                        <span>{report.lastKnownLocation}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748B' }}>{report.reportedTime}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <Badge
                        variant={
                          report.status === 'RESOLVED'
                            ? 'green'
                            : report.status === 'MATCHED'
                            ? 'blue'
                            : 'amber'
                        }
                        size="sm"
                      >
                        {report.status === 'SEARCHING'
                          ? t.lostFound.badgeSearching
                          : report.status === 'MATCHED'
                          ? t.lostFound.badgeMatched
                          : t.lostFound.badgeResolved}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 500 }}>{report.assignedTeam}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {report.photoUrl && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setMatchModalReport(report);
                              setMatchTestImage(null);
                              setMatchResult(null);
                            }}
                            icon={<Scan size={12} />}
                            title="Verify/Match with CCTV or Found Photo"
                            style={{ backgroundColor: '#0284C7', borderColor: '#0284C7' }}
                          >
                            AI Match
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReport(report)}
                          icon={<Eye size={12} />}
                        >
                          {t.lostFound.btnView}
                        </Button>
                        {report.status !== 'RESOLVED' && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleUpdateStatus(report.id, 'RESOLVED')}
                          >
                            {t.lostFound.btnResolve}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Enlarged Photo Zoom Modal */}
      {zoomedPhoto && (
        <Modal
          isOpen={Boolean(zoomedPhoto)}
          onClose={() => setZoomedPhoto(null)}
          title={t.lostFound.photoPreviewTitle}
          subtitle="High-resolution visual reference for patrol officers & volunteer tracing squads."
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '100%',
                maxHeight: '440px',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #E2E8F0',
                padding: '10px',
              }}
            >
              <img
                src={zoomedPhoto}
                alt="Enlarged Tracing Photograph"
                style={{
                  maxWidth: '100%',
                  maxHeight: '400px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                }}
              />
            </div>
            <Button variant="outline" onClick={() => setZoomedPhoto(null)} style={{ alignSelf: 'flex-end' }}>
              {t.common.close}
            </Button>
          </div>
        </Modal>
      )}

      {/* View Detail Modal with Photo Display */}
      {selectedReport && (
        <Modal
          isOpen={Boolean(selectedReport)}
          onClose={() => setSelectedReport(null)}
          title={`${t.lostFound.modalDetailTitle} — ${selectedReport.id}`}
          subtitle={selectedReport.type.replace('_', ' ')}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Visual Identification Photo Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
              }}
            >
              {selectedReport.photoUrl ? (
                <div
                  onClick={() => setZoomedPhoto(selectedReport.photoUrl || null)}
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '3px solid #F47C20',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    flexShrink: 0,
                    backgroundColor: '#FFFFFF',
                    position: 'relative',
                  }}
                  title={t.lostFound.viewFullPhoto}
                >
                  <img
                    src={selectedReport.photoUrl}
                    alt={selectedReport.nameOrItem}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      color: '#FFFFFF',
                      fontSize: '9px',
                      textAlign: 'center',
                      padding: '2px 0',
                      fontWeight: 600,
                    }}
                  >
                    ZOOM
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '12px',
                    backgroundColor: '#E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748B',
                    gap: '4px',
                    flexShrink: 0,
                  }}
                >
                  <User size={28} />
                  <span style={{ fontSize: '10px', fontWeight: 600 }}>No Photo</span>
                </div>
              )}

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {selectedReport.nameOrItem}
                  </h3>
                  <Badge variant={selectedReport.status === 'RESOLVED' ? 'green' : 'amber'} size="sm">
                    {selectedReport.status}
                  </Badge>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                  Contact: <strong style={{ color: '#0F172A' }}>{selectedReport.contactNumber}</strong>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  Reported: <span>{selectedReport.reportedTime}</span>
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                {t.lostFound.labelDesc}
              </div>
              <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.5, marginTop: '4px' }}>
                {selectedReport.ageOrDescription}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t.lostFound.labelLocation}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '4px' }}>
                  {selectedReport.lastKnownLocation}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t.lostFound.colTeam}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '4px' }}>
                  {selectedReport.assignedTeam}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
              {selectedReport.status !== 'RESOLVED' && (
                <Button
                  variant="success"
                  onClick={() => handleUpdateStatus(selectedReport.id, 'RESOLVED')}
                >
                  {t.lostFound.reunitedSuccess}
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedReport(null)}>
                {t.common.close}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* File New Report Modal with Photo Upload & Presets */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={t.lostFound.modalNewTitle}
        subtitle={t.lostFound.modalNewSubtitle}
      >
        <form onSubmit={handleCreateReport} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              {t.lostFound.labelCategory}
            </label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as any)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
            >
              <option value="MISSING_PERSON">Missing Pilgrim (Person) • लापता तीर्थयात्री</option>
              <option value="FOUND_PERSON">Found / Unaccompanied Person • मिले व्यक्ति</option>
              <option value="LOST_ITEM">Lost Belongings / Documents • खोया सामान</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              {t.lostFound.labelName} *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Chandra (Age 65)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
            />
          </div>

          {/* ── PHOTO UPLOAD SECTION ── */}
          <div
            style={{
              padding: '12px',
              backgroundColor: '#F8FAFC',
              borderRadius: '10px',
              border: '1.5px dashed #CBD5E1',
            }}
          >
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
              📷 {t.lostFound.labelPhoto}
            </label>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '10px' }}>
              {t.lostFound.labelPhotoHint}
            </p>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />

            {/* Photo preview or upload buttons */}
            {newPhotoUrl ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: '#FFFFFF',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <img
                  src={newPhotoUrl}
                  alt="Selected preview"
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '2px solid #F47C20',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {photoFileName || 'Photo Selected'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} /> Ready for report attachment
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  style={{
                    border: 'none',
                    backgroundColor: '#FEE2E2',
                    color: '#DC2626',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <X size={13} /> {t.lostFound.labelPhotoRemove}
                </button>
              </div>
            ) : (
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  icon={<Upload size={14} />}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {t.lostFound.labelPhotoChoose}
                </Button>

                {/* Quick Presets for Demo */}
                <div style={{ marginTop: '10px' }}>
                  <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600, marginBottom: '6px' }}>
                    {t.lostFound.labelOrSample}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {[
                      { key: 'elderlyMale', label: t.lostFound.sampleElderlyMale, url: PRESET_AVATARS.elderlyMale },
                      { key: 'elderlyFemale', label: t.lostFound.sampleElderlyFemale, url: PRESET_AVATARS.elderlyFemale },
                      { key: 'child', label: t.lostFound.sampleChild, url: PRESET_AVATARS.child },
                      { key: 'adultMale', label: t.lostFound.sampleAdultMale, url: PRESET_AVATARS.adultMale },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleSelectPreset(item.url, item.label)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 4px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#F47C20')}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#CBD5E1')}
                      >
                        <img
                          src={item.url}
                          alt={item.label}
                          style={{ width: '36px', height: '36px', borderRadius: '6px' }}
                        />
                        <span style={{ fontSize: '10.5px', color: '#334155', fontWeight: 600, lineHeight: 1.2 }}>
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              {t.lostFound.labelDesc} *
            </label>
            <textarea
              required
              rows={3}
              placeholder={t.lostFound.labelDescPlaceholder}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                {t.lostFound.labelLocation} *
              </label>
              <input
                type="text"
                required
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                {t.lostFound.labelContact}
              </label>
              <input
                type="text"
                placeholder="+91 98XXX XXXXX"
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>
              {t.lostFound.btnCancel}
            </Button>
            <Button variant="saffron" type="submit">
              {t.lostFound.btnSubmit}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Live AI Face Recognition Modal for Lost & Found Matching */}
      <LiveFaceDetectionModal
        isOpen={isFaceScanOpen}
        onClose={() => setIsFaceScanOpen(false)}
        zone="Gate-A"
      />

      {/* AI Face Verification / Match Modal for Specific Missing Person */}
      {matchModalReport && (
        <Modal
          isOpen={!!matchModalReport}
          onClose={() => {
            setMatchModalReport(null);
            setMatchTestImage(null);
            setMatchResult(null);
          }}
          title={`AI Face Verification — ${matchModalReport.nameOrItem}`}
          subtitle="Compare CCTV footage or found person photo against this registered missing report"
          maxWidth="750px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Top Person Summary Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 16px',
                backgroundColor: '#F8FAFC',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
              }}
            >
              {matchModalReport.photoUrl ? (
                <img
                  src={matchModalReport.photoUrl}
                  alt={matchModalReport.nameOrItem}
                  style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', border: '2px solid #BAE6FD' }}
                />
              ) : (
                <div style={{ width: '56px', height: '56px', borderRadius: '10px', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={24} color="#64748B" />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                    {matchModalReport.nameOrItem}
                  </h4>
                  <Badge variant="amber" size="sm">{matchModalReport.id}</Badge>
                </div>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: '4px 0 0' }}>
                  {matchModalReport.ageOrDescription}
                </p>
                <div style={{ fontSize: '11.5px', color: '#0284C7', marginTop: '2px' }}>
                  📍 Last Seen: {matchModalReport.lastKnownLocation}
                </div>
              </div>
            </div>

            {/* Upload Test Image Section */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Upload CCTV Capture / Found Person Photo to Verify:
              </label>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => matchFileInputRef.current?.click()}
                  icon={<Upload size={14} />}
                >
                  Choose Test Photo
                </Button>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  {matchTestImage ? 'Photo loaded ready to compare' : 'Upload an image of the person to verify AI recognition'}
                </span>
                <input
                  ref={matchFileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (ev.target?.result) {
                          setMatchTestImage(ev.target.result as string);
                          setMatchResult(null);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>

              {matchTestImage && (
                <div style={{ marginTop: '12px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <img
                    src={matchTestImage}
                    alt="Test Frame"
                    style={{
                      width: '140px',
                      height: '140px',
                      borderRadius: '10px',
                      objectFit: 'cover',
                      border: '2px solid #CBD5E1',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <Button
                      variant="saffron"
                      size="md"
                      isLoading={isMatching}
                      onClick={async () => {
                        if (!matchTestImage) return;
                        setIsMatching(true);
                        setMatchResult(null);
                        try {
                          const res = await faceService.detectFaces(matchTestImage, 'Gate-A');
                          if (res.data) {
                            setMatchResult(res.data);
                          }
                        } catch (err: any) {
                          alert(`AI Inference error: ${err?.message || 'Server unavailable'}`);
                        } finally {
                          setIsMatching(false);
                        }
                      }}
                      icon={<Sparkles size={16} />}
                    >
                      Compare Face with AI
                    </Button>
                    <p style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
                      Extracts 10,000-dimensional normalized facial vectors and measures zero-mean cosine correlation against security registry.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Match Result Display */}
            {matchResult && (
              <div style={{ marginTop: '4px' }}>
                {matchResult.faces && matchResult.faces.length > 0 ? (
                  matchResult.faces.map((f: any, idx: number) => {
                    const isDirectMatch =
                      f.is_recognized &&
                      (f.name.toLowerCase().includes(matchModalReport.nameOrItem.toLowerCase()) ||
                        matchModalReport.nameOrItem.toLowerCase().includes(f.name.toLowerCase()) ||
                        f.person_id === matchModalReport.id);

                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '14px 18px',
                          borderRadius: '10px',
                          backgroundColor: isDirectMatch ? '#ECFDF5' : f.is_recognized ? '#EFF6FF' : '#FFFBEB',
                          border: `1.5px solid ${isDirectMatch ? '#10B981' : f.is_recognized ? '#3B82F6' : '#F59E0B'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <CheckCircle2
                            size={24}
                            color={isDirectMatch ? '#10B981' : f.is_recognized ? '#3B82F6' : '#F59E0B'}
                          />
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                              {isDirectMatch ? (
                                <span style={{ color: '#065F46' }}>
                                  MATCH CONFIRMED: Identified as {f.name} ({Math.round(f.confidence * 100)}% Confidence)
                                </span>
                              ) : f.is_recognized ? (
                                <span style={{ color: '#1E40AF' }}>
                                  Identified as Registered Person: {f.name} ({Math.round(f.confidence * 100)}%)
                                </span>
                              ) : (
                                <span style={{ color: '#92400E' }}>
                                  Face Detected but Unregistered: {f.name} ({Math.round(f.confidence * 100)}%)
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                              {f.details ? `${f.details} • ` : ''}Zone: {matchResult.zone} • AI Timestamp: {new Date().toLocaleTimeString()}
                            </div>
                          </div>
                        </div>

                        {isDirectMatch && matchModalReport.status !== 'MATCHED' && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => {
                              handleUpdateStatus(matchModalReport.id, 'MATCHED');
                              alert(`Report ${matchModalReport.id} successfully updated to MATCHED!`);
                              setMatchModalReport(null);
                            }}
                          >
                            Confirm & Mark Matched
                          </Button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#B91C1C',
                      fontSize: '13px',
                    }}
                  >
                    No human face was detected in the uploaded frame. Please upload a clear headshot or portrait.
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setMatchModalReport(null);
                  setMatchTestImage(null);
                  setMatchResult(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
