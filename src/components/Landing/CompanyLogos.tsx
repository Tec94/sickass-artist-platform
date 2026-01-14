import React from 'react';

const LOGOS = [
  'simple-icons:adobe',
  'simple-icons:beats',
  'simple-icons:spotify',
  'simple-icons:roland',
  'simple-icons:fender',
  'simple-icons:pioneer',
];

export const CompanyLogos: React.FC = () => {
  return (
    <div className="company-logos-container">
      {LOGOS.map(logo => (
        <div key={logo} className="logo-item">
          <iconify-icon icon={logo}></iconify-icon>
        </div>
      ))}

      <style>{`
        .company-logos-container {
          display: flex;
          align-items: center;
          gap: 32px;
          opacity: 0.3;
          filter: grayscale(1);
          transition: opacity 0.3s ease;
        }

        .company-logos-container:hover {
          opacity: 0.6;
        }

        .logo-item {
          width: 96px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }

        .logo-item:hover {
          transform: scale(1.1);
        }

        .logo-item iconify-icon {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};
