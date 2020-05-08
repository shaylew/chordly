import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { EventObject } from 'xstate';

import { Song, Chord } from '../types';
import { ChordButtonInterpreter } from '../machines/types';
import TimelineProgress from './TimelineProgress';
import TimelineSlot from './TimelineSlot';
import ChordButton, { ChordButtonProps } from './ChordButton';

export type TimelineProps<TEvent extends EventObject> = {
  song: Song;
  playing?: boolean;
  playingIndex?: number;
  onDelete?: (chord: Chord, index: number) => void;
  chordProps: Partial<ChordButtonProps<TEvent>>;
  service?: ChordButtonInterpreter<TEvent>;
};

const useStyles = makeStyles({
  root: {
    position: 'relative',
    display: 'grid',
    gridTemplateRows: 'min-content auto',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gridAutoRows: '1fr',
    alignItems: 'stretch',
    gridGap: '16px',
  },
});

export function Timeline<T extends EventObject>(
  props: TimelineProps<T>,
): JSX.Element {
  const { song, onDelete, playing, playingIndex, chordProps, service } = props;
  const totalBars = song.measures.length;

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <TimelineProgress totalBars={totalBars} playing={playing} />
      {song.measures.map((measure, i) => {
        const selected = i === playingIndex;
        const chord = measure.chord;
        return (
          <TimelineSlot
            key={i}
            onDelete={onDelete && (() => onDelete(chord, i))}
          >
            <ChordButton
              chord={chord}
              highlight={selected}
              service={service}
              {...chordProps}
            />
          </TimelineSlot>
        );
      })}
    </div>
  );
}

export default Timeline;
