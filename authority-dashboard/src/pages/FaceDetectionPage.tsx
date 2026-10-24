import React from 'react';
import { LiveFaceDetectionStudio } from '../components/camera/LiveFaceDetectionStudio';

export const FaceDetectionPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
          Live Optical Face Detection & Recognition AI
        </h2>
        <p style={{ fontSize: '14px', color: '#64748B', marginTop: '3px' }}>
          Real-time optical AI face detection and biometric identity verification across security gates.
        </p>
      </div>

      <LiveFaceDetectionStudio />
    </div>
  );
};
export default FaceDetectionPage;
