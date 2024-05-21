import React from 'react';
import './TextModal.css'; 

interface TextModalProps {
  text: string;
  onClose: () => void;
}

const TextModal: React.FC<TextModalProps> = ({ text, onClose }) => {
  return (
    <>
    <div className="modal-wrapper" onClick={onClose}></div>
    <div className="modal-container">
      <h2>LMCI (Late Mild Cognitive Impairment)</h2>
      <br></br>
      <p>
       This stage represents further progression from EMCI, with more pronounced memory and cognitive difficulties. These difficulties are still considered mild but are more likely to interfere with daily activities compared to the EMCI stage. People in this stage are at a higher risk of progressing to Alzheimer's disease.
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
