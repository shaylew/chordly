import React from 'react';
import { Interpreter } from 'xstate';

import {
  Card,
  CardContent,
  IconButton,
  makeStyles,
  createStyles,
} from '@material-ui/core';
import PlayIcon from '@material-ui/icons/PlayCircleFilled';
import PauseIcon from '@material-ui/icons/PauseCircleOutline';
import LoopIcon from '@material-ui/icons/Loop';

import { Key } from '../types';
import Timeline from './Timeline';
import {
  TimelineContext,
  TimelineSchema,
  TimelineEvent,
} from '../machines/timeline';
import KeySelect from './KeySelect';

export type SongCardProps = {
  playing: boolean;
  looping: boolean;
  keySignature?: Key;
  onTogglePlay?: () => void;
  onToggleLoop?: () => void;
  isSelectingKey?: boolean;
  onSelectKey?: () => void;
  onSelectKeyCancel?: () => void;
  timelineMachine: Interpreter<TimelineContext, TimelineSchema, TimelineEvent>;
};

const useStyles = makeStyles(theme =>
  createStyles({
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      backgroundColor: theme.palette.primary.main,
      paddingRight: theme.spacing(2),
    },
    headerRight: {
      width: '25%',
      display: 'flex',
      justifyContent: 'center',
      padding: theme.spacing(1),
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      width: '75%',
    },
    keySelect: {
      border: 'solid #DDD 2px',
    },
  }),
);

const useButtonStyles = makeStyles(theme =>
  createStyles({
    root: {},
    colorSecondary: {
      color: theme.palette.grey[200],
    },
    label: {},
  }),
);

const useIconStyles = makeStyles(_theme =>
  createStyles({
    root: {
      fontSize: '3rem',
    },
  }),
);

export const SongCard: React.FC<SongCardProps> = props => {
  const {
    playing,
    looping,
    keySignature,
    onTogglePlay,
    onToggleLoop,
    isSelectingKey,
    onSelectKey,
    onSelectKeyCancel,
    timelineMachine,
  } = props;

  const classes = useStyles();
  const buttonClasses = useButtonStyles();
  const iconClasses = useIconStyles();

  const icon = !playing ? (
    <PlayIcon classes={iconClasses} />
  ) : (
    <PauseIcon classes={iconClasses} />
  );

  return (
    <Card raised style={{ marginTop: '1.5em' }}>
      <div className={classes.header}>
        <div className={classes.headerLeft}>
          <IconButton
            aria-label="play"
            onClick={onTogglePlay}
            color="default"
            classes={buttonClasses}
          >
            {icon}
          </IconButton>
          <IconButton
            aria-label="loop"
            color={looping ? 'secondary' : 'default'}
            size="small"
            onClick={onToggleLoop}
            classes={buttonClasses}
          >
            <LoopIcon fontSize="large" />
          </IconButton>
        </div>
        <div className={classes.headerRight}>
          <KeySelect
            keySignature={keySignature}
            selected={isSelectingKey}
            onClick={onSelectKey}
            onClickAway={onSelectKeyCancel}
          />
        </div>
      </div>
      <CardContent>
        <Timeline
          playing={playing}
          keySignature={keySignature}
          stateMachineRef={timelineMachine}
        />
      </CardContent>
    </Card>
  );
};

export default SongCard;
