import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';

import { SynthProvider } from '../components/SynthContext';

import ChordGrid from '../components/ChordGrid';

const Index: NextPage<{}> = () => {
  return (
    <SynthProvider>
      <main>
        <h1>Click Me?</h1>
        <ChordGrid />
        <style jsx>{`
          main {
            min-height: 100vh;
            height: 100%;
            background-color: #222;
          }
        `}</style>
      </main>
    </SynthProvider>
  );
};

export default Index;
