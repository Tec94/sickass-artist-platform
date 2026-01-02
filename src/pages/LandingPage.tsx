import React, { useEffect } from 'react';
import { Navbar } from '../components/Landing/Navbar';
import { Hero } from '../components/Landing/Hero';
import { CommunityHub } from '../components/Landing/CommunityHub';
import { Merchandise } from '../components/Landing/Merchandise';
import { WorkInProgress } from '../components/Landing/WorkInProgress';
import { FlashlightEffect } from '../components/Effects/FlashlightEffect';
import { NoodleConnector } from '../components/Effects/NoodleConnector';

export const LandingPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <FlashlightEffect className="landing-page">
      <Navbar />
      <main>
        <div id="hero" style={{ position: 'relative' }}>
          <Hero />
          <NoodleConnector start={{ x: 1000, y: 400 }} end={{ x: 100, y: 700 }} />
        </div>
        <div id="community" style={{ position: 'relative' }}>
          <CommunityHub />
          <NoodleConnector start={{ x: 100, y: 400 }} end={{ x: 1100, y: 700 }} />
        </div>
        <div id="store" style={{ position: 'relative' }}>
          <Merchandise />
          <NoodleConnector start={{ x: 1100, y: 400 }} end={{ x: 100, y: 700 }} />
        </div>
        <div id="tour" style={{ position: 'relative' }}>
          <WorkInProgress />
        </div>
      </main>

      <style>{`
        .landing-page {
          background: #000;
          color: white;
          min-height: 100vh;
        }
        
        main {
          position: relative;
          z-index: 1;
        }

        section {
          position: relative;
          z-index: 2;
        }
      `}</style>
    </FlashlightEffect>
  );
};
