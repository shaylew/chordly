import React, { useMemo, useState } from 'react';
import { makeStyles, Paper, IconButton } from '@material-ui/core';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';

import { Send, ChordButtonEvent } from '../machines/types';
import { KeyboardEvent, KeyboardContext } from '../machines/keyboard';
import { FifthsLayout, ChromaticLayout } from '../lib/keyboard-layout';
import ChordButton from './ChordButton';
import Keyboard from './Keyboard';

export type SidebarProps = {
  sendKeyboard?: Send<KeyboardEvent>;
  sendButton?: Send<ChordButtonEvent>;
  keyboardContext: KeyboardContext;
  keyboardDisabled?: boolean;
};

const useStyles = makeStyles({
  root: {
    position: 'sticky',
    height: '100vh',
    width: '33vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  currentChord: {
    flex: '0 0 100px',
    height: '100px',
  },
  options: {
    flex: '0 0 200px',
    height: '200px',
  },
  keyboard: {
    flex: '1 1 0',
    position: 'relative',
  },
  keyboardSvg: {
    position: 'absolute',
    height: '100%',
  },
  toggleButton: {
    position: 'absolute',
    bottom: '0.5em',
    left: '0.5em',
  },
});

export const Sidebar: React.FC<SidebarProps> = props => {
  const {
    sendKeyboard,
    sendButton,
    keyboardContext,
    keyboardDisabled = false,
  } = props;

  const { keySignature, chord } = keyboardContext;

  const layouts = useMemo(
    () => [new ChromaticLayout(4), new FifthsLayout(4)],
    [],
  );
  const [layoutIx, setLayoutIx] = useState(0);
  const toggleLayout = (): void => {
    setLayoutIx(1 - layoutIx);
    sendKeyboard &&
      sendKeyboard({
        type: 'KEYBOARD.LAYOUT.SET',
        layout: layouts[1 - layoutIx],
      });
  };

  const classes = useStyles();
  const paperProps = useMemo(() => ({ square: true, elevation: 0 }), []);

  return (
    <Paper square elevation={8} className={classes.root}>
      <div className={classes.currentChord}>
        {chord && (
          <ChordButton
            chord={chord}
            keySignature={keySignature}
            minimumParts={4}
            send={sendButton}
            paperProps={paperProps}
          />
        )}
      </div>
      <div className={classes.keyboard}>
        <Keyboard
          send={sendKeyboard}
          context={keyboardContext}
          className={classes.keyboardSvg}
          disabled={keyboardDisabled}
        />
      </div>
      <IconButton className={classes.toggleButton} onClick={toggleLayout}>
        <SwapHorizIcon />
      </IconButton>
    </Paper>
  );
};

export default Sidebar;
