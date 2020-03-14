import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Container, Paper, Box } from '@material-ui/core';

import { SynthProvider } from '../components/SynthContext';
import ChordGrid from '../components/ChordGrid';

const Index: NextPage<{}> = () => {
  return (
    <SynthProvider>
      <Paper elevation={0}>
        <Container maxWidth="lg">
          <Paper elevation={2}>
            <h1>Click Me?</h1>
            <ChordGrid />
          </Paper>
        </Container>
      </Paper>
    </SynthProvider>
  );
};

export default Index;
