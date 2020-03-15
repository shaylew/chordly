import React from 'react';
import { Grid } from '@material-ui/core/';

import { PitchClass, Chord } from '../types';
import { ChordPlayButton } from './ChordPlayButton';

export type EmphasisLevel = 'high' | 'medium' | 'low';

export type ChordGridProps = {
  onChordClick?: (chord: Chord) => void;
  emphasis?: Map<PitchClass, EmphasisLevel>;
};

export const ChordGrid: React.FC<ChordGridProps> = props => {
  const { onChordClick } = props;
  const pcs: PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const flavors = [
    { name: 'major', symbol: '', intervals: [0, 4, 7] },
    { name: 'minor', symbol: 'm', intervals: [0, 3, 7] },
  ];

  return (
    <Grid container spacing={2}>
      {flavors.map(({ name, intervals, symbol }) => (
        <Grid item key={name} xs={12}>
          <h2>{name}</h2>
          <Grid container spacing={1}>
            {pcs.map(pc => {
              const chord = { root: pc, intervals, symbol };
              return (
                <Grid item key={pc} xs={1}>
                  <ChordPlayButton chord={chord} onChordClick={onChordClick} />
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
