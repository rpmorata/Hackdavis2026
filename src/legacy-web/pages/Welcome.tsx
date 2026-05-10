import React from 'react';
import { useNavigate } from 'react-router';
import { Globe, ArrowRight } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';

export function Welcome() {
  const navigate = useNavigate();
  const { profile } = useProfile();

  const handleGetStarted = () => {
    if (profile?.onboardingComplete) {
      navigate('/home');
    } else {
      navigate('/onboarding');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between max-w-[480px] mx-auto px-6 py-16 bg-background"
      style={{}}
    >
      {/* Hero - centered */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {/* Logo mark */}
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8 bg-primary"
        >
          <Globe size={48} className="text-primary-foreground" strokeWidth={1.5} />
        </div>

        <h1 style={{ fontSize: '40px', fontWeight: 700, lineHeight: 1.1 }} className="mb-3 text-primary">
          ClarityMD
        </h1>
        <p
          className="max-w-[280px] text-muted-foreground"
          style={{ fontSize: '18px', lineHeight: 1.5 }}
        >
          Understand your healthcare in your own language
        </p>
      </div>

      {/* CTA */}
      <div className="w-full flex flex-col gap-3">
        <button
          onClick={handleGetStarted}
          className="w-full flex items-center justify-center gap-2 rounded-2xl transition-all active:scale-95 bg-accent text-accent-foreground"
          style={{
            height: 56,
            fontSize: '17px',
            fontWeight: 700,
          }}
        >
          {profile?.onboardingComplete ? 'Open My App' : 'Get Started'}
          <ArrowRight size={20} />
        </button>

        <p className="text-center text-muted-foreground" style={{ fontSize: '13px' }}>
          Free for patients · No clinician enrollment required
        </p>

        <div
          className="mt-2 rounded-xl p-3 text-center bg-card"
        >
          <p className="text-muted-foreground" style={{ fontSize: '12px', lineHeight: 1.5 }}>
            ClarityMD is an AI-assisted communication tool, not a licensed medical interpreter
            and does not provide medical advice. All clinical decisions must be made by a qualified
            healthcare provider.
          </p>
        </div>
      </div>
    </div>
  );
}