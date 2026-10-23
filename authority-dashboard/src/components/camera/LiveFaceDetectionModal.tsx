import React from 'react';
import { Modal } from '../common/Modal';
import { LiveFaceDetectionStudio } from './LiveFaceDetectionStudio';

interface LiveFaceDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  zone?: string;
}

export const LiveFaceDetectionModal: React.FC<LiveFaceDetectionModalProps> = ({
  isOpen,
  onClose,
  zone = 'Gate-A',
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Live Face Detection & Recognition AI Studio"
      subtitle="Real-time optical AI face tracking and KNN facial recognition against Kumbh pilgrim security registry"
      maxWidth="1100px"
    >
      <LiveFaceDetectionStudio onClose={onClose} initialZone={zone} />
    </Modal>
  );
};
export default LiveFaceDetectionModal;
