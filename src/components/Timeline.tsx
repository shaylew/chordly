import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Song, Chord } from '../types';
import { Send, ChordButtonEvent } from '../machines/types';
import TimelineProgress from './TimelineProgress';
import TimelineSlot from './TimelineSlot';
import ChordButton, { ChordButtonProps } from './ChordButton';
import AddButton from './AddButton';

export type TimelineProps = {
  song: Song;
  playing?: boolean;
  playingIndex?: number;
  onDelete?: (chord: Chord, index: number) => void;
  onAdd?: () => void;
  selectedChord?: Chord;
  chordProps: Partial<ChordButtonProps>;
  send?: Send<ChordButtonEvent>;
};

const useStyles = makeStyles({
  root: {
    position: 'relative',
    display: 'grid',
    gridTemplateRows: 'min-content',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gridAutoRows: '1fr',
    alignItems: 'stretch',
    gridGap: '16px',
  },
});

export const Timeline: React.FC<TimelineProps> = props => {
  const {
    send,
    song,
    onDelete,
    onAdd,
    selectedChord,
    playing,
    playingIndex,
    chordProps,
  } = props;
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
              send={send}
              top="name"
              bottom="notes"
              {...chordProps}
            />
          </TimelineSlot>
        );
      })}
      <TimelineSlot>
        <AddButton
          onClick={onAdd}
          chord={selectedChord}
          keySignature={chordProps.keySignature}
        />
      </TimelineSlot>
    </div>
  );
};

export default Timeline;
