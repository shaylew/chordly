import React, { useState, useEffect } from 'react';
import { LinearProgress, makeStyles } from '@material-ui/core';
import * as Tone from 'tone';
import clsx from 'clsx';

export type TimelineProgressProps = {
  totalBars: number;
  playing?: boolean;
};

const useProgressStyles = makeStyles({
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
});

const useCustomStyles = makeStyles({
  root: {
    opacity: 1,
    transition: 'opacity 0.5s ease-in-out 0.2s',
  },
  fade: {
    opacity: 0,
  },
});

function positionToPercent(position = '0:0:0', totalBars: number): number {
  const [bars, quarters, sixteenths = 0] = position.split(':').map(t => +t);
  const progress = (bars + quarters / 4 + sixteenths / 16) / totalBars;
  return Math.floor(100 * Math.min(1, progress));
}

export const TimelineProgress: React.FC<TimelineProgressProps> = props => {
  const { playing, totalBars } = props;

  const classes = useProgressStyles();
  const customClasses = useCustomStyles();
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
  }, [totalBars]);

  return (
    <LinearProgress
      value={playing ? position : 0}
      variant={'determinate'}
      classes={classes}
      className={clsx(
        customClasses.root,
        position === 100 && customClasses.fade,
      )}
    />
  );
};

export default TimelineProgress;
