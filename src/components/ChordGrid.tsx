import React from 'react';
import { Grid } from '@material-ui/core/';

import { PitchClass, Chord, Key, Octave } from '../types';
import { ChordPlayButton } from './ChordPlayButton';

export type EmphasisLevel = 'high' | 'medium' | 'low';

export type ChordGridProps = {
  onChordClick?: (chord: Chord) => void;
  keySignature?: Key;
};

export const ChordGrid: React.FC<ChordGridProps> = props => {
  const { onChordClick, keySignature } = props;
  const pcs: PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const flavors = [
    { name: 'major', symbol: '', intervals: [0, 4, 7, 12] },
    { name: 'minor', symbol: 'm', intervals: [0, 3, 7, 12] },
  ];
  const octaves: Octave[] = [3, 4];

  return (
    <Grid container spacing={2}>
      {flavors.map(({ name, intervals, symbol }) => (
        <Grid item key={name} xs={12}>
          <h2>{name}</h2>
          <Grid container spacing={1}>
            {octaves.map(octave =>
              pcs.map(root => {
                const name = `${octave}${symbol}`;
                const chord = { root, intervals, symbol, octave };
                return (
                  <Grid item key={`${root}${name}`} xs={1}>
                    <ChordPlayButton
                      {...{ chord, keySignature, onChordClick }}
                    />
                  </Grid>
                );
              }),
            )}
          </Grid>
        </Grid>
      ))}
    </Grid>
  );
};

export default ChordGrid;
