import React from 'react';
import { Grid, ButtonBase, LinearProgress } from '@material-ui/core';
import * as Tone from 'tone';

import { Song, Measure } from '../types';
import { ChordPlayButton } from './ChordPlayButton';
import usePlayer from './PlayerContext';

export type TimelineProps = {
  song: Song;
};

const Bar: React.FC<{ measure: Measure }> = props => {
  const { measure } = props;

  return (
    <ButtonBase component="div" style={{ width: '100%' }}>
      <ChordPlayButton chord={measure.chord} />
    </ButtonBase>
  );
};

export const Timeline: React.FC<TimelineProps> = props => {
  const { song } = props;
  const player = usePlayer();

  const play = (): void => {
    if (player) {
      player.scheduleSong(song);
      Tone.Transport.start();
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <button onClick={play}>play!</button>
      </Grid>
      <Grid item xs={12}>
        <LinearProgress value={10} variant="determinate" />
      </Grid>
      <Grid item container spacing={2}>
        {song.measures.map((measure, i) => (
          <Grid item xs={3} key={i}>
            <Bar measure={measure} />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

export default Timeline;
