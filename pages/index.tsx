import React from 'react';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';

const Boop = dynamic(() => import('../components/boop'), { ssr: false });

const Index: NextPage<{}> = () => {
  return (
    <div>
      <h1>Click Me?</h1>
      <Boop />
    </div>
  );
};

export default Index;
