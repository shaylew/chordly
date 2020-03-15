import React from 'react';
import { NextPage } from 'next';
import { Container, Paper } from '@material-ui/core';

import { App } from '../src/components/App';
import { PlayerProvider } from '../src/components/PlayerContext';

const Index: NextPage<{}> = () => {
  return (
    <PlayerProvider>
      <Paper elevation={0} style={{ minHeight: '100vh' }}>
        <Container maxWidth="lg">
          <App />
        </Container>
      </Paper>
    </PlayerProvider>
  );
};

export default Index;
