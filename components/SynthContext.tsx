import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';

import { Synth, createSynth } from '../lib/types';

export const SynthContext: React.Context<Synth | null> = React.createContext<Synth | null>(
  null,
);

export function useSynth(): Synth | null {
  return React.useContext(SynthContext);
}

export const SynthProvider: React.FC = props => {
  const [synth, setSynth] = useState<Synth | null>(null);
  useEffect(() => {
    const s = createSynth();
    setSynth(s);
    return (): void => void s.dispose();
  }, []);

  return (
    <SynthContext.Provider value={synth}>
      {props.children}
    </SynthContext.Provider>
  );
};

export default useSynth;
