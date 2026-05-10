import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function AIDisclaimer() {
  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-start gap-2">
      <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={14} />
      <p className="text-amber-800" style={{ fontSize: '12px', lineHeight: '1.4' }}>
        <span style={{ fontWeight: 600 }}>AI-assisted tool — not medical advice.</span>{' '}
        ClarityMD is not a licensed medical interpreter. All clinical decisions must be made by your
        healthcare provider. AI translations may contain errors.
      </p>
    </div>
  );
}
