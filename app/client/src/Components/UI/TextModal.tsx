import React from 'react';
import './TextModal.css'; 

interface TextModalProps {
  short: string;
  long: string;
  desc: string;
  onClose: () => void;
}

const TextModal: React.FC<TextModalProps> = ({ short, long, desc, source, onClose }) => {
  return (
    <>
    <div className="modal-wrapper" onClick={onClose}></div>
    <div className="modal-container">
      <h2>{short} ({long})</h2>
      <br></br>
      <img src={source} alt="CN" className="max-h-64 rounded-md" />
      <br></br>
      <p>
       {desc}
      </p>
      <br></br>
      <button className="modal-btn" onClick={onClose}>
        Close
      </button>
    </div>
    </>
  );
};

export default TextModal;
