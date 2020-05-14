import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import Delete from '@material-ui/icons/Delete';

export type TimelineSlotProps = {
  onDelete?: () => void;
};

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    position: 'relative',
    zIndex: 10,
  },
  controls: {},
  remove: {
    opacity: 0.7,
    transition: 'opacity 0.5s ease-in-out',
    '@media (any-hover: hover)': {
      '$root:not(:hover) &': {
        opacity: 0,
      },
    },
  },
  noRemove: {
    visibility: 'hidden',
    pointerEvents: 'none',
  },
});

export const TimelineSlot: React.FC<TimelineSlotProps> = props => {
  const { onDelete, children } = props;
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {children}
      <Button
        className={onDelete ? classes.remove : classes.noRemove}
        variant="text"
        startIcon={<Delete />}
        onClick={onDelete}
      >
        Remove
      </Button>
    </div>
  );
};

export default TimelineSlot;
