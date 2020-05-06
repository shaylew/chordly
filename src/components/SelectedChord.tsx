import React from 'react';

import { ButtonBase, Theme, makeStyles } from '@material-ui/core';
import AddCircleOutline from '@material-ui/icons/AddCircleOutline';

import { Key, Chord } from '../lib/music-theory';
import ChordDisplay, { ChordButtonEvents, mkChordEvents } from './ChordDisplay';

export type SelectedChordProps = {
  keySignature?: Key;
  chord?: Chord;
  onChordAdd?: () => void;
  chordEvents?: ChordButtonEvents<undefined>;
};

const useChordBarStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    alignItems: 'stretch',
    gridGap: '0.5em 1.5em',
  },
  addButton: {
    ...theme.typography.button,
    color: theme.palette.primary.main,
    flexDirection: 'column',
    padding: '1em',
    justifyContent: 'space-around',
  },
  addIcon: {
    fontSize: '4rem',
  },
  buttonWrapper: {
    display: 'flex',
    gridColumn: 3,
    justifyContent: 'flex-end',
  },
  chordWrapper: {
    gridColumn: 4,
    display: 'flex',
    justifyContent: 'stretch',
  },
  keyHeader: {
    gridColumn: 'span 2',
    textAlign: 'center',
  },
  chordHeader: {
    gridColumn: 'span 2',
    textAlign: 'center',
  },
}));

export const SelectedChord: React.FC<SelectedChordProps> = props => {
  const { keySignature, chord, onChordAdd, chordEvents = {} } = props;

  const classes = useChordBarStyles();

  let chordElement;
  if (chord) {
    const events = mkChordEvents(chordEvents, chord, undefined);
    chordElement = (
      <ChordDisplay chord={chord} keySignature={keySignature} {...events} />
    );
  } else {
    chordElement = <div>Use the keyboard below to pick a chord!</div>;
  }

  return (
    <div className={classes.root}>
      <div className={classes.keyHeader}>key signature</div>
      <div className={classes.chordHeader}>selected chord</div>

      <div className={classes.buttonWrapper}>
        <ButtonBase
          name="add-chord-button"
          aria-label="add to song"
          classes={{ root: classes.addButton }}
          onClick={onChordAdd}
          disabled={!chord}
        >
          <AddCircleOutline
            classes={{ root: classes.addIcon }}
            color="primary"
          />
          add
        </ButtonBase>
      </div>

      <div className={classes.chordWrapper}>{chordElement}</div>
    </div>
  );
};

export default SelectedChord;
