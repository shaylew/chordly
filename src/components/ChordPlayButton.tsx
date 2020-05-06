import React from 'react';
import { useMachine } from '@xstate/react';

import { Chord } from '../types';
import usePlayer from './PlayerContext';
import { ChordDisplayProps, ChordDisplay } from './ChordDisplay';
import holdButtonMachine from '../machines/holdButton';

export type ChordPlayButtonProps = ChordDisplayProps;

export const ChordPlayButton: React.FC<ChordPlayButtonProps> = props => {
  const {
    chord,
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    onClick,
    ...rest
  } = props;

  const player = usePlayer();

  const [_current, send] = useMachine(holdButtonMachine, {
    actions: {
      pressEffect: () => {
        player?.triggerChordStart(chord);
      },
      releaseEffect: () => {
        player?.triggerChordEnd(chord);
      },
    },
  });

  return (
    <ChordDisplay
      chord={chord}
      {...rest}
      onMouseDown={e => {
        send('PRESS');
        onMouseDown && onMouseDown(e);
      }}
      onMouseUp={e => {
        send('RELEASE');
        onMouseUp && onMouseUp(e);
      }}
      onMouseLeave={e => {
        send('RELEASE');
        onMouseLeave && onMouseLeave(e);
      }}
      onClick={e => {
        send('CLICK');
        onClick && onClick(e);
      }}
    />
  );
};

export default ChordPlayButton;
