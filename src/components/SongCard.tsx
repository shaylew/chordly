import React from 'react';
import { useMachine } from '@xstate/react';

import { Card, CardContent, IconButton } from '@material-ui/core';
import PlayIcon from '@material-ui/icons/PlayCircleFilled';
import PauseIcon from '@material-ui/icons/PauseCircleFilled';
import LoopIcon from '@material-ui/icons/Loop';

import { Song } from '../types';
import Timeline from './Timeline';
import usePlayer from './PlayerContext';
import timelineMachine from '../machines/timeline';

export type SongCardProps = {
  song: Song;
};

export const SongCard: React.FC<SongCardProps> = props => {
  const { song } = props;
  const player = usePlayer();

  const [current, send] = useMachine(timelineMachine, {
    actions: {
      startSong: () => {
        player?.setSong(song);
        player?.startSong(() => send('FINISHED_PLAYING'));
      },
      stopSong: () => {
        player?.stopSong();
      },
    },
  });

  player?.setLoop(current.context.loop);

  const playing = current.value === 'playing' || current.value === 'finished';

  const icon = !playing ? <PlayIcon /> : <PauseIcon />;
  const togglePlayback = (): void => {
    playing ? send('STOP_PLAYING') : send('START_PLAYING');
  };
  const toggleRepeat = (): void => {
    send('TOGGLE_REPEAT');
  };

  return (
    <Card raised>
      <CardContent>
        <IconButton aria-label="play" color="primary" onClick={togglePlayback}>
          {icon}
        </IconButton>
        <IconButton
          aria-label="loop"
          color={current.context.loop ? 'primary' : 'default'}
          onClick={toggleRepeat}
        >
          <LoopIcon />
        </IconButton>
      </CardContent>
      <CardContent>
        <Timeline song={song} playing={playing} />
      </CardContent>
    </Card>
  );
};

export default SongCard;
