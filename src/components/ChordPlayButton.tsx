import React from 'react';
import { useMachine } from '@xstate/react';

import { Chord } from '../types';
import usePlayer from './PlayerContext';
import { ChordButtonProps, ChordButton } from './ChordButton';
import holdButtonMachine from '../machines/holdButton';

export type ChordPlayButtonProps = {
  onChordClick?: (chord: Chord) => void;
} & ChordButtonProps;

export const ChordPlayButton: React.FC<ChordPlayButtonProps> = props => {
  const { chord, onChordClick, ...rest } = props;

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
      onMouseUp={() => send('RELEASE')}
      onMouseLeave={() => send('RELEASE')}
      onClick={() => {
        send('CLICK');
        if (onChordClick) {
          onChordClick(chord);
        }
      }}
    />
  );
};

export default ChordPlayButton;
