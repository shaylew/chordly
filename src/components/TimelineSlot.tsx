import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { ButtonBase } from '@material-ui/core';

import { Measure } from '../types';
import ChordPlayButton from './ChordPlayButton';

export type TimelineSlotProps = {
  measure: Measure | null;
};

const useStyles = makeStyles({
  root: {
    position: 'relative',
    minHeight: '6em',
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& ~ &': {
      borderLeft: 'solid black 2px',
    },
  },
  behind: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
});

const Empty: React.FC = () => <div>[ psyche ]</div>;

export const TimelineSlot: React.FC<TimelineSlotProps> = props => {
  const { measure } = props;
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <ButtonBase component="div" className={classes.behind}></ButtonBase>
      {measure ? <ChordPlayButton chord={measure.chord} /> : <Empty />}
    </div>
  );
};

export default TimelineSlot;
