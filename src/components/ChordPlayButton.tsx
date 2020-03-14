import React from 'react';
import { useMachine } from '@xstate/react';

import usePlayer from './PlayerContext';
import { ChordButtonProps, ChordButton } from './ChordButton';
import holdButtonMachine from '../machines/holdButton';

export const ChordPlayButton: React.FC<ChordButtonProps> = props => {
  const { chord, ...rest } = props;

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
    <ChordButton
      chord={chord}
      {...rest}
      onMouseDown={() => send('PRESS')}
      onClick={() => send('CLICK')}
      onMouseUp={() => send('RELEASE')}
      onMouseLeave={() => send('RELEASE')}
    />
  );
};

export default ChordPlayButton;
