import React from 'react';
import { Grid } from '@material-ui/core/';

import { PitchClass, ChordType, Chord, Key, Octave } from '../types';
import { ChordPlayButton } from './ChordPlayButton';

export type EmphasisLevel = 'high' | 'medium' | 'low';

export type ChordGridProps = {
  onChordClick?: (chord: Chord) => void;
  keySignature?: Key;
};

export const ChordGrid: React.FC<ChordGridProps> = props => {
  const { onChordClick, keySignature } = props;
  const pcs: PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const flavors = [ChordType.major(), ChordType.minor()];
  const octaves: Octave[] = [3, 4];

  return (
    <Grid container spacing={2}>
      {flavors.map(type => (
        <Grid item key={type.symbol} xs={12}>
          <h2>{type.symbol}</h2>
          <Grid container spacing={1}>
            {octaves.map(octave =>
              pcs.map(root => {
                const chord = new Chord(root, type, { octave });
                const name = chord.name(keySignature?.accidentals);
                return (
                  <Grid item key={name} xs={1}>
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
