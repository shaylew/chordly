import React from 'react';

import useSynth from '../components/SynthContext';
import { PitchClass, Interval, Chord, toNotes } from '../lib/types';
import { ChordButton } from './ChordButton';

export type EmphasisLevel = 'high' | 'medium' | 'low';

export type ChordGridProps = {
  emphasis?: Map<PitchClass, EmphasisLevel>;
};

export const ChordGrid: React.FC<ChordGridProps> = props => {
  const { emphasis } = props;
  const pcs: PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const flavors = [
    { name: 'major', intervals: [0, 4, 7] },
    { name: 'minor', intervals: [0, 3, 7] },
  ];

  const synth = useSynth();
  const play = (chord: Chord): (() => void) => {
    const notes = toNotes(chord);
    return (): void => {
      if (synth) {
        console.log(notes);
        synth.triggerAttackRelease(notes, '4n');
      }
    };
  };

  return (
    <div>
      {flavors.map(({ name, intervals }) => (
        <div key={name} className="row">
          <div className="label">{name}</div>
          {pcs.map(pc => (
            <ChordButton
              key={pc}
              root={pc}
              label={name}
              onClick={play({ root: pc, intervals })}
            />
          ))}
        </div>
      ))}
      <style jsx>{`
        div.container {
          display: flex;
          flex-direction: column;
        }
        div.row {
          display: flex;
          flex-direction: row;
          justify-content: space-evenly;
          align-items: stretch;
        }
      `}</style>
    </div>
  );
};

export default ChordGrid;
