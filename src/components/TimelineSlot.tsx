import React from 'react';
import clsx from 'clsx';

import { makeStyles } from '@material-ui/core/styles';
import { ButtonBase } from '@material-ui/core';

import { Measure, Key } from '../types';
import ChordPlayButton from './ChordPlayButton';

export type TimelineSlotProps = {
  measure: Measure | null;
  keySignature?: Key;
  selected?: boolean;
  onClick?: () => void;
};

const useStyles = makeStyles({
  root: {
    position: 'relative',
    minHeight: '6em',
    flexGrow: 1,
    padding: '0.5em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'dotted 2px #ddd',
    // selection background
    '&::after': {
      content: '""',
      position: 'absolute',
      zIndex: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#EEE',
      opacity: 0,
      transition: 'opacity 0.4s ease-in-out',
    },
  },
  selected: {
    '&::after': {
      opacity: 1,
    },
  },
  behind: {
    position: 'absolute',
    zIndex: 10,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
});

const Empty: React.FC = () => <div>[ psyche ]</div>;

export const TimelineSlot: React.FC<TimelineSlotProps> = props => {
  const { measure, selected, keySignature, onClick } = props;
  const classes = useStyles();

  return (
    <div
      className={clsx(classes.root, selected && classes.selected)}
      onClick={onClick}
    >
      <ButtonBase component="div" className={classes.behind}></ButtonBase>
      {measure ? (
        <ChordPlayButton keySignature={keySignature} chord={measure.chord} />
      ) : (
        <Empty />
      )}
    </div>
  );
};

export default TimelineSlot;
