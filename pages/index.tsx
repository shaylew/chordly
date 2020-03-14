import React from 'react';
import { NextPage } from 'next';
import { Container, Paper, Grid } from '@material-ui/core';

import { PlayerProvider } from '../components/PlayerContext';
import ChordGrid from '../components/ChordGrid';
import Timeline from '../components/Timeline';
import { Song } from '../lib/types';

const song: Song = {
  measures: [
    { chord: { root: 2, intervals: [0, 3, 7], symbol: 'm' } },
    { chord: { root: 5, intervals: [0, 4, 7] } },
    { chord: { root: 7, intervals: [0, 4, 7] } },
    { chord: { root: 0, intervals: [0, 4, 7, 12] } },
  ],
};

const Index: NextPage<{}> = () => {
  return (
    <PlayerProvider>
      <Paper elevation={0} style={{ minHeight: '100vh' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Paper elevation={2}>
                <Timeline song={song} />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper elevation={2}>
                <ChordGrid />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Paper>
    </PlayerProvider>
  );
};

export default Index;
