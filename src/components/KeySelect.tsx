import React, { useCallback } from 'react';
import {
  Select,
  makeStyles,
  FormControl,
  MenuItem,
  Theme,
} from '@material-ui/core';

import { EventObject } from 'xstate';
import { useService } from '@xstate/react';

import {
  KeySignatureContext,
  SetEvent,
  ChordButtonEvent,
  KeySignatureInterpreter,
} from '../machines/types';
import {
  pitchClasses,
  prettyName,
  Key,
  isPitchClass,
  isKeyType,
} from '../lib/music-theory';
import ChordDisplay from './ChordButton';

const useKeySelectStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'stretch',
    fontSize: '80%',
  },
  signature: {},
  formControl: {
    margin: theme.spacing(1),
    minWdith: 120,
  },
  numerals: {
    flex: '1 1 auto',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'stretch',
  },
  numeralButton: {
    flex: '1 0 8%',
    margin: `0 ${theme.spacing(1)}px`,
  },
}));

export type KeySelectProps<
  TContext extends KeySignatureContext,
  TEvent extends EventObject
> = {
  service: KeySignatureInterpreter<
    TContext,
    TEvent | SetEvent | ChordButtonEvent
  >;
};

export function KeySelect<
  TContext extends KeySignatureContext,
  TEvent extends EventObject
>(props: KeySelectProps<TContext, TEvent>): JSX.Element {
  const { service } = props;
  const [state, send] = useService(service);
  const { keySignature } = state.context;

  const onChangeTonic = useCallback(
    (e: React.ChangeEvent<{ value: unknown }>): void => {
      const value = e.target.value;
      if (isPitchClass(value)) {
        const key = Key.named(keySignature.type, value);
        send({ type: 'SET.KEY', keySignature: key });
      }
    },
    [send, keySignature],
  );

  const onChangeName = useCallback(
    (e: React.ChangeEvent<{ value: unknown }>): void => {
      const value = e.target.value;
      if (isKeyType(value)) {
        const key = Key.named(value, keySignature.tonic);
        send({ type: 'SET.KEY', keySignature: key });
      }
    },
    [send, keySignature],
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
        {keySignature.notes.map((_pc, degree) => {
          const chord = keySignature.naturalChord(degree + 1);
          return (
            <ChordDisplay
              key={degree}
              service={service}
              className={classes.numeralButton}
              chord={chord}
              keySignature={keySignature}
              top="roman"
              bottom="none"
            />
          );
        })}
      </div>
    </div>
  );
}

export default KeySelect;
