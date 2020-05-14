import React from 'react';
import { makeStyles, ButtonBase, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import { Chord, Key } from '../types';
import { useNoteColors, colorFor } from '../lib/colors';
import clsx from 'clsx';

export type AddButtonProps = {
  chord?: Chord;
  keySignature?: Key;
  onClick?: () => void;
  disabled?: boolean;
};

const useStyles = makeStyles({
  root: {
    fontSize: 'min(2em, 3vw)',
    flex: '1 1 auto',
    position: 'relative',
    display: 'grid',
    gridTemplateRows: '4fr 2fr',
    gridAutoColumns: 'minmax(1.6em, 1fr)',
    alignItems: 'stretch',
    overflow: 'hidden',
    border: `solid 2px var(--note-color-700)`,
    borderRadius: '8px',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      zIndex: -1,
      opacity: 0.25,
      background: 'var(--note-color-100)',
    },
  },
  addWrapper: {
    gridColumn: '1',
    gridRow: '1 / span 2',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'var(--note-color-700)', // theme.palette.grey[300], //
    color: 'var(--note-color-50)',
  },
  add: {
    opacity: 0.9,
    fontSize: '4rem',
  },
  chord: {
    gridRow: '1',
    gridColumn: '2 / span 2',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: '0.125em',
    color: 'var(--note-color-900)',
  },
  message: {
    opacity: 0.9,
    gridRow: '2',
    gridColumn: '2 / span 2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const AddButton: React.FC<AddButtonProps> = props => {
  const { chord, keySignature, onClick, disabled = false } = props;

  const classes = useStyles();
  const colors = useNoteColors();

  return (
    <ButtonBase
      disabled={disabled}
      component="div"
      className={clsx(classes.root, colors[colorFor(chord?.root)])}
      onClick={onClick}
    >
      <div className={classes.addWrapper}>
        <AddIcon className={classes.add} />
      </div>
      <div className={classes.chord}>
        {chord?.name(keySignature?.accidentals)}
      </div>
      <div className={classes.message}>
        <Typography variant="button">add chord</Typography>
      </div>
    </ButtonBase>
  );
};

export default AddButton;
