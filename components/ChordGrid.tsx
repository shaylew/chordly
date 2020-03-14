import React from 'react';
import { Grid, Paper } from '@material-ui/core/';

import useSynth from '../components/SynthContext';
import { PitchClass, Chord, toNotes, noteName } from '../lib/types';
import { ChordButton } from './ChordButton';

export type EmphasisLevel = 'high' | 'medium' | 'low';

export type ChordGridProps = {
  emphasis?: Map<PitchClass, EmphasisLevel>;
};

export const ChordGrid: React.FC<ChordGridProps> = props => {
  // const { emphasis } = props;
  const pcs: PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const flavors = [
    { name: 'major', symbol: '', intervals: [0, 4, 7] },
    { name: 'minor', symbol: 'm', intervals: [0, 3, 7] },
  ];

  const synth = useSynth();
  const makeHandlers = (chord: Chord) => {
    const notes = toNotes(chord);
    return {
      onClick: () => synth && synth.triggerAttackRelease(notes, '4n'),
      // onMouseDown: () => synth && synth.triggerAttack(notes),
      // onMouseUp: () => synth && synth.triggerRelease(notes),
    };
  };

  return (
    <Grid container spacing={2}>
      {flavors.map(({ name, intervals, symbol }) => (
        <Grid item key={name} xs={12}>
          <h2>{name}</h2>
          <Grid container spacing={1}>
            {pcs.map(pc => {
              const handlers = makeHandlers({
                root: pc,
                intervals,
              });
              return (
                <Grid item key={pc} xs={1}>
                  <ChordButton
                    root={pc}
                    label={noteName(pc) + symbol}
                    {...handlers}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      ))}
    </Grid>
  );
};

export default ChordGrid;
