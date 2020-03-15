import React from 'react';
import clsx from 'clsx';

import { makeStyles } from '@material-ui/core/styles';
import { Typography, IconButton, ClickAwayListener } from '@material-ui/core';
import VpnKeyIcon from '@material-ui/icons/VpnKey';

import { Key, keyToChord } from '../types';
import TimelineSlot from './TimelineSlot';

export type KeySelectProps = {
  keySignature?: Key;
  selected?: boolean;
  onClick?: () => void;
  onClickAway?: () => void;
};

const useStyles = makeStyles({
  root: {
    position: 'relative',
    minHeight: '6em',
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    width: '100%',
    textAlign: 'right',
    left: '-100%',
    paddingRight: '1em',
  },
  icon: {
    flex: '0 1 4em',
  },
});

export const KeySelect: React.FC<KeySelectProps> = props => {
  const { keySignature, selected, onClick, onClickAway } = props;
  const classes = useStyles();

  const chord = keySignature ? { chord: keyToChord(keySignature) } : null;
  const icon = keySignature ? (
    <TimelineSlot measure={chord} selected={selected} onClick={onClick} />
  ) : (
    <IconButton>
      <VpnKeyIcon />
    </IconButton>
  );

  return (
    <ClickAwayListener onClickAway={() => onClickAway && onClickAway()}>
      <div className={classes.root}>
        <span className={classes.label}>
          <Typography variant="h4">Key</Typography>
        </span>
        {icon}
      </div>
    </ClickAwayListener>
  );
};

export default KeySelect;
