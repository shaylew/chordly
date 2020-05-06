import React from 'react';
import clsx from 'clsx';

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
    opacity: 0,
    transition: 'opacity 0.5s ease-in-out',
    '$root:hover &': {
      opacity: 0.7,
    },
  },
});

const Empty: React.FC = () => <div>[ psyche ]</div>;

export const TimelineSlot: React.FC<TimelineSlotProps> = props => {
  const { onDelete, children } = props;
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {children}
      <Button
        className={classes.remove}
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
