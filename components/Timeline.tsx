import React from 'react';
import { Grid, Paper, ButtonBase } from '@material-ui/core';
import * as Tone from 'tone';

import { Song, Measure } from '../lib/types';
import { ChordButton } from './ChordButton';
import usePlayer from './PlayerContext';

export type TimelineProps = {
  song: Song;
};

const Bar: React.FC<{ measure: Measure }> = props => {
  const { measure } = props;

  return (
    <ButtonBase component="div" style={{ width: '100%' }}>
      <ChordButton chord={measure.chord} />
    </ButtonBase>
  );
};

export const Timeline: React.FC<TimelineProps> = props => {
  const { song } = props;
  const player = usePlayer();

  const play = () => {
    if (player) {
      player.scheduleSong(song);
      Tone.Transport.start();
    }
  };

  return (
    <div>
      <div>
        <button onClick={play}>play!</button>
      </div>
      <Grid container spacing={2}>
        {song.measures.map((measure, i) => (
          <Grid item xs={3} key={i}>
            <Bar measure={measure} />
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Timeline;
