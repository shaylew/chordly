import React, { useCallback, useMemo } from 'react';
import {
  Select,
  makeStyles,
  FormControl,
  MenuItem,
  Theme,
} from '@material-ui/core';

import { ChordButtonEvent, Send } from '../machines/types';
import {
  pitchClasses,
  prettyName,
  Key,
  isPitchClass,
  isKeyType,
} from '../lib/music-theory';
import ChordButton from './ChordButton';

const useKeySelectStyles = makeStyles((theme: Theme) => {
  const s1 = theme.spacing(1);
  const s2 = theme.spacing(2);
  return {
    root: {
      display: 'flex',
      alignItems: 'stretch',
      marginTop: `${s2}px`,
    },
    signature: {},
    formControl: {
      margin: `${s1}px ${s1}px 0 ${s1}px`,
      minWidth: '4em',
      fontSize: '125%',
    },
    numerals: {
      flex: '1 1 auto',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'stretch',
    },
    numeralButton: {
      flex: '1 0 0',
      margin: `0 ${s1}px`,
    },
  };
});

export type KeySelectProps = {
  sendKey?: Send<{ type: 'SET.KEY'; keySignature: Key }>;
  sendButton?: Send<ChordButtonEvent>;
  keySignature: Key;
};

export const KeySelectRaw: React.FC<KeySelectProps> = props => {
  const { sendKey, sendButton, keySignature } = props;

  const onChangeTonic = useCallback(
    (e: React.ChangeEvent<{ value: unknown }>): void => {
      const value = e.target.value;
      if (isPitchClass(value)) {
        const key = Key.named(keySignature.type, value);
        sendKey && sendKey({ type: 'SET.KEY', keySignature: key });
      }
    },
    [sendKey, keySignature],
  );

  const onChangeName = useCallback(
    (e: React.ChangeEvent<{ value: unknown }>): void => {
      const value = e.target.value;
      if (isKeyType(value)) {
        const key = Key.named(value, keySignature.tonic);
        sendKey && sendKey({ type: 'SET.KEY', keySignature: key });
      }
    },
    [sendKey, keySignature],
  );

  const degreeChords = useMemo(
    () =>
      keySignature.notes.map((_pc, degree) =>
        keySignature.naturalChord(degree + 1),
      ),
    [keySignature],
  );

  const classes = useKeySelectStyles();

  return (
    <div className={classes.root}>
      <div className={classes.signature}>
        <FormControl className={classes.formControl}>
          <Select
            id="key-select-tonic"
            value={keySignature.tonic}
            onChange={onChangeTonic}
          >
            {pitchClasses.map(pc => (
              <MenuItem key={pc} value={pc}>
                {prettyName(pc)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl className={classes.formControl}>
          <Select value={keySignature.type} onChange={onChangeName}>
            <MenuItem value={'major'}>major</MenuItem>
            <MenuItem value={'minor'}>minor</MenuItem>
            <MenuItem value={'chromatic'}>chromatic</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div className={classes.numerals}>
        {degreeChords.map((chord, degree) => (
          <ChordButton
            key={degree}
            send={sendButton}
            className={classes.numeralButton}
            chord={chord}
            keySignature={keySignature}
            top="roman"
            bottom="none"
          />
        ))}
      </div>
    </div>
  );
};

export const KeySelect = React.memo(KeySelectRaw);

export default KeySelect;
