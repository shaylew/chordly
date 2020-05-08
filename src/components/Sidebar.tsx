import React, { useMemo, useState } from 'react';
import { useService } from '@xstate/react';
import { makeStyles, Paper, Tabs, Tab } from '@material-ui/core';

import { ChordButtonInterpreter } from '../machines/types';
import { KeyboardInterpreter } from '../machines/keyboard';
import { FifthsLayout, ChromaticLayout } from '../lib/keyboard-layout';
import ChordButton from './ChordButton';
import Keyboard from './Keyboard';

export type SidebarProps = {
  keyboardService: KeyboardInterpreter;
  buttonService?: ChordButtonInterpreter;
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
});

export const Sidebar: React.FC<SidebarProps> = props => {
  const { keyboardService, buttonService, keyboardDisabled = false } = props;

  const [state, send] = useService(keyboardService);
  const { keySignature, chord: selectedChord } = state.context;

  const layouts = useMemo(
    () => [new ChromaticLayout(4), new FifthsLayout(4)],
    [],
  );
  const [layoutIx, setLayoutIx] = useState(0);

  const classes = useStyles();

  return (
    <Paper square elevation={8} className={classes.root}>
      <div className={classes.currentChord}>
        {selectedChord && (
          <ChordButton
            chord={selectedChord}
            keySignature={keySignature}
            minimumParts={4}
            service={buttonService}
          />
        )}
      </div>
      <div className={classes.keyboard}>
        <Keyboard
          keyboardService={keyboardService}
          className={classes.keyboardSvg}
          disabled={keyboardDisabled}
        />
      </div>
      <Tabs
        value={layoutIx}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        onChange={(_, i) => {
          setLayoutIx(i);
          send({ type: 'KEYBOARD.LAYOUT.SET', layout: layouts[i] });
        }}
      >
        <Tab label="Chromatic" />
        <Tab label="Fifths" />
      </Tabs>
    </Paper>
  );
};

export default Sidebar;
