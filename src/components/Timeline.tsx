import React from 'react';
import { Interpreter } from 'xstate';
import { useService } from '@xstate/react';

import { makeStyles } from '@material-ui/core/styles';
import { ClickAwayListener } from '@material-ui/core';

import { Key } from '../types';
import {
  TimelineEvent,
  TimelineContext,
  TimelineSchema,
} from '../machines/timeline';
import TimelineProgress from './TimelineProgress';
import TimelineSlot from './TimelineSlot';

export type TimelineProps = {
  playing?: boolean;
  keySignature?: Key;
  stateMachineRef: Interpreter<TimelineContext, TimelineSchema, TimelineEvent>;
};

const useStyles = makeStyles({
  root: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  slotWrapper: {
    flexGrow: 1,
    padding: '0.5em',
  },
});

export const Timeline: React.FC<TimelineProps> = props => {
  const { playing, stateMachineRef, keySignature } = props;
  const classes = useStyles();

  const [current, send] = useService(stateMachineRef);
  const state = current || stateMachineRef.initialState;

  const { song, selectedMeasure } = state.context;
  const totalBars = song.measures.length;

  return (
    <div className={classes.root}>
      <TimelineProgress totalBars={totalBars} playing={playing} />
      {song.measures.map((measure, i) => {
        const selected = i === selectedMeasure;
        return (
          <ClickAwayListener
            key={i}
            onClickAway={() => selected && send('DESELECT')}
          >
            <div className={classes.slotWrapper}>
              <TimelineSlot
                keySignature={keySignature}
                measure={measure}
                selected={selected}
                onClick={() => send({ type: 'MEASURE.SELECT', id: i })}
              />
            </div>
          </ClickAwayListener>
        );
      })}
    </div>
  );
};

export default Timeline;
