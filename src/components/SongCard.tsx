import React from 'react';
import { Interpreter } from 'xstate';
import { useService } from '@xstate/react';
import * as Tone from 'tone';

import { Card, CardContent, IconButton } from '@material-ui/core';
import PlayIcon from '@material-ui/icons/PlayCircleFilled';
import PauseIcon from '@material-ui/icons/PauseCircleFilled';
import LoopIcon from '@material-ui/icons/Loop';

import Timeline from './Timeline';
import {
  TimelineContext,
  TimelineSchema,
  TimelineEvent,
} from '../machines/timeline';
import { PlayerContext, PlayerSchema, PlayerEvent } from '../machines/player';

export type SongCardProps = {
  timelineMachine: Interpreter<TimelineContext, TimelineSchema, TimelineEvent>;
  playerMachine: Interpreter<PlayerContext, PlayerSchema, PlayerEvent>;
};

export const SongCard: React.FC<SongCardProps> = props => {
  const { timelineMachine, playerMachine } = props;

  const [pCurrent, pSend] = useService(playerMachine);
  const [_tCurrent, tSend] = useService(timelineMachine);

  const playing =
    pCurrent !== undefined &&
    (pCurrent.matches('playing') || pCurrent.matches('finished'));
  const looping = pCurrent && pCurrent.context.loop;

  const togglePlayback = (): void => {
    // unfortunately if we let the machine do this the browser forgets
    // that the action was user-initiated and prevents the sound.
    Tone.start();
    playing ? pSend('PLAYER.STOP') : pSend('PLAYER.START');
    tSend('DESELECT');
  };

  const toggleLoop = (): void => {
    pSend('PLAYER.TOOGLE_LOOP');
  };

  const icon = !playing ? <PlayIcon /> : <PauseIcon />;

  return (
    <Card raised>
      <CardContent>
        <IconButton aria-label="play" color="primary" onClick={togglePlayback}>
          {icon}
        </IconButton>
        <IconButton
          aria-label="loop"
          color={looping ? 'primary' : 'default'}
          onClick={toggleLoop}
        >
          <LoopIcon />
        </IconButton>
      </CardContent>
      <CardContent>
        <Timeline playing={playing} stateMachineRef={timelineMachine} />
      </CardContent>
    </Card>
  );
};

export default SongCard;
