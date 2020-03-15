import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import { Song } from '../types';
import TimelineProgress from './TimelineProgress';
import TimelineSlot from './TimelineSlot';

export type TimelineProps = {
  song: Song;
  playing?: boolean;
};

const staffColor = 'rgba(0, 0, 0, 0.8)';

const useStyles = makeStyles({
  root: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    borderTop: `solid 2px ${staffColor}`,
    borderBottom: `solid 2px ${staffColor}`,
  },
  staffStart: {
    content: '""',
    position: 'relative',
    zIndex: 1,
    display: 'block',
    flexBasis: 10,
    borderLeft: `solid 6px ${staffColor}`,
    borderRight: `solid 2px ${staffColor}`,
  },
  staffEnd: {
    content: '""',
    position: 'relative',
    zIndex: 1,
    display: 'block',
    flexBasis: 10,
    borderLeft: `solid 2px ${staffColor}`,
    borderRight: `solid 6px ${staffColor}`,
  },
});

export const Timeline: React.FC<TimelineProps> = props => {
  const { song, playing } = props;
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <TimelineProgress totalBars={4} playing={playing} />
      <div className={classes.staffStart} />
      {song.measures.map((measure, i) => (
        <TimelineSlot key={i} measure={measure} />
      ))}
      <div className={classes.staffEnd} />
    </div>
  );
};

export default Timeline;
