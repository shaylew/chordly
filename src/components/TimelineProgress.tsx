import React, { useState, useEffect } from 'react';
import { LinearProgress, withStyles } from '@material-ui/core';
import * as Tone from 'tone';

export type TimelineProgressProps = {
  totalBars: number;
  playing?: boolean;
};

const StyledProgress = withStyles({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: 'auto',
  },
  colorPrimary: {
    backgroundColor: 'white',
  },
  barColorPrimary: {
    backgroundColor: '#EEE',
  },
  bar1Determinate: {
    transition: 'transform .1s linear',
  },
})(LinearProgress);

function positionToPercent(position = '0:0:0', totalBars: number): number {
  const [bars, quarters, sixteenths = 0] = position.split(':').map(t => +t);
  const progress = (bars + quarters / 4 + sixteenths / 16) / totalBars;
  return Math.floor(100 * Math.min(1, progress));
}

export const TimelineProgress: React.FC<TimelineProgressProps> = props => {
  const { playing, totalBars } = props;
  const [position, setPosition] = useState(0);
  const [animation, _setAnimation] = useState({ ref: null as null | number });

  function animate(): void {
    setPosition(
      positionToPercent(Tone.Transport.position as string, totalBars),
    );
    animation.ref = requestAnimationFrame(animate);
  }

  useEffect(() => {
    animation.ref = requestAnimationFrame(animate);
    return () => {
      animation.ref && cancelAnimationFrame(animation.ref);
    };
  }, []);

  return (
    <StyledProgress value={playing ? position : 0} variant="determinate" />
  );
};

export default TimelineProgress;
