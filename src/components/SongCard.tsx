import React from 'react';

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

export type SongCardProps = {
  playing: boolean;
  looping: boolean;
  onTogglePlay?: () => void;
  onToggleLoop?: () => void;
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
  const { children, playing, looping, onTogglePlay, onToggleLoop } = props;

  const classes = useStyles();
  const buttonClasses = useButtonStyles();
  const iconClasses = useIconStyles();

  const icon = !playing ? (
    <PlayIcon classes={iconClasses} />
  ) : (
    <PauseIcon classes={iconClasses} />
  );

  return (
    <Card raised>
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
      </div>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default SongCard;
