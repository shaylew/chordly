import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Key, Song, Chord } from '../types';
import TimelineProgress from './TimelineProgress';
import TimelineSlot from './TimelineSlot';
import ChordDisplay, {
  ChordDisplayProps,
  ChordButtonEvents,
  mkChordEvents,
} from './ChordDisplay';

export type TimelineProps = {
  song: Song;
  playing?: boolean;
  playingIndex?: number;
  onDelete?: (chord: Chord, index: number) => void;
  chordProps: Partial<ChordDisplayProps>;
  chordEvents: ChordButtonEvents<number>;
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

export const Timeline: React.FC<TimelineProps> = props => {
  const {
    song,
    onDelete,
    playing,
    playingIndex,
    chordProps,
    chordEvents,
  } = props;
  const totalBars = song.measures.length;

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <TimelineProgress totalBars={totalBars} playing={playing} />
      {song.measures.map((measure, i) => {
        const selected = i === playingIndex;
        const chord = measure.chord;
        const events = mkChordEvents(chordEvents, chord, i);
        return (
          <TimelineSlot
            key={i}
            onDelete={onDelete && (() => onDelete(chord, i))}
          >
            <ChordDisplay
              chord={chord}
              highlight={selected}
              {...chordProps}
              {...events}
            />
          </TimelineSlot>
        );
      })}
    </div>
  );
};

export default Timeline;
