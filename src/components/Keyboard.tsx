import React, { useCallback } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core';
import { useService } from '@xstate/react';

import { PitchClass, prettyName, pcToName } from '../types';
import { FactorName } from '../lib/music-theory';
import { useNoteColors } from '../lib/colors';
import { Shape, SVGGrid } from './HexGrid';
import { KeyboardCell } from '../lib/keyboard-layout';
import { KeyboardInterpreter } from '../machines/keyboard';

export type Emphasis = undefined | 'low' | 'medium' | 'high';
export type EmphasisLevels = Partial<Record<PitchClass, Emphasis>>;

export type NoteKeyProps = {
  pitchClass: PitchClass; // the note this key plays
  label?: string; // what the key says
  root?: boolean; // is this key on the bottom tier
  inKey?: boolean; // is this note in the current key (if any)
  selected?: boolean; // is this note a selected chord part
  selectable?: boolean; // is this note interactable
  emphasis?: Emphasis;
  showAs?: 'ghost' | 'collapsed' | 'expanded';
  onClick?: React.MouseEventHandler;
};

const delayFactor = 1;
const transitionFactor = 1;
function standardTransition(transitionTime = 0.5, delayTime = 0): string {
  const transition = transitionTime * transitionFactor;
  const delay = delayTime * delayFactor;
  return [
    `transform ${transition}s ease-out ${delay}s`,
    `opacity ${transition}s ease-out ${delay}s`,
  ].join(', ');
}

const useKeyStyles = makeStyles({
  root: {},
  selectable: {
    '& $hexagon': {
      opacity: 0.4,
    },
    '& $hexagonOverlay': {
      // opacity: 0.35,
    },
    '&:hover $hexagonOverlay': {
      opacity: 0.8,
    },
    '& $content': {
      opacity: 0.7,
    },
  },
  selected: {
    '& $hexagon': {
      opacity: 1,
    },
    '& $hexagonOverlay': {
      opacity: 0.7,
      stroke: 'var(--note-color-900)',
      strokeWidth: '9px',
    },
    '& $content': {
      opacity: 1,
      fontWeight: '600',
    },
  },
  expanded: {},
  ghost: {
    '& circle': {},
    '&:not($selected) $hexagon': {
      opacity: 0,
    },
  },
  collapsed: {
    '& $allHexagons': {
      opacity: 0,
      // transform: `scale(${collapsedSize})`,
    },
    '& $content': {
      // transform: `scale(0.6)`,
      pointerEvents: 'none',
    },
  },
  inKey: {},
  notInKey: {},
  resonatingCurrent: {},
  resonatingPrevious: {},
  isRoot: {
    '& $hexagon': {
      opacity: 0.4,
    },
    '& $hexagonOverlay': {},
  },
  allHexagons: {},
  hexagon: {
    transition: standardTransition(),
    opacity: 0.2,
    willChange: 'opacity',
    fill: 'var(--note-color-200)',
    // stroke: 'var(--note-color-500)',
    // strokeWidth: '8px',
  },
  hexagonOverlay: {
    transition: standardTransition(),
    opacity: 0,
    willChange: 'opacity',
    strokeWidth: '6px',
    stroke: 'black',
  },
  hexagonEdge: {
    stroke: 'white',
    strokeWidth: '3px',
  },
  circle: {
    fill: '#E0E0E0',
    stroke: 'none',
    opacity: 0,
  },
  circleOverlay: {
    fill: '#E0E0E0',
    stroke: 'none',
    opacity: 0,
  },
  content: {
    opacity: 0,
    transition: standardTransition(),
    cursor: 'pointer',
    userSelect: 'none',
    '$selectable &': {
      pointerEvents: 'visible',
    },
  },
  label: {
    fontSize: '0.33px', // svg pixels
    textAnchor: 'middle',
    alignmentBaseline: 'middle',
    letterSpacing: 'normal',
    fill: 'var(--note-color-900)',
  },
});

const NoteKey: React.FC<NoteKeyProps> = props => {
  const {
    pitchClass,
    onClick,
    root = false,
    selected = false,
    selectable = false,
    label = prettyName(pcToName(pitchClass)),
  } = props;

  const colors = useNoteColors();
  const classes = useKeyStyles();

  const colorClass = colors[`note-${pitchClass}`];
  const shapeClasses = {
    root: clsx(colorClass, classes.root, {
      [classes.expanded]: true, //showAs === 'expanded',
      // [classes.collapsed]: showAs === 'collapsed',
      // [classes.ghost]: showAs === 'ghost',
      [classes.selected]: selected,
      [classes.selectable]: selectable,
      [classes.isRoot]: root,
      // [classes.inKey]: inKey,
      // [classes.notInKey]: !inKey,
      // [classes.resonatingCurrent]: emphasis === 'high',
      // [classes.resonatingPrevious]: emphasis === 'medium',
    }),
    hexagon: classes.hexagon,
    hexagonOverlay: classes.hexagonOverlay,
    hexagonEdge: classes.hexagonEdge,
    allHexagons: classes.allHexagons,
    circle: classes.circle,
    circleOverlay: classes.circleOverlay,
    content: classes.content,
  };

  return (
    <Shape classes={shapeClasses}>
      <g onMouseDown={onClick}>
        <circle cx={0} cy={0} r={0.5} fill="none" />
        <text x="0" y="0" className={classes.label}>
          {label}
        </text>
      </g>
    </Shape>
  );
};

export type KeyboardProps = {
  keyboardService: KeyboardInterpreter;
  disabled?: boolean;
  className?: string;
};

export const Keyboard: React.FC<KeyboardProps> = props => {
  const { keyboardService, disabled, className } = props;

  const [state, send] = useService(keyboardService);
  const { layout, chord: selectedChord, root: rootCell } = state.context;

  // You may be asking yourself: is all this memoization worth it?
  // The answer is yes, rerendering 80ish keys worth of nested svg
  // does negatively impact the user experience, so we avoid it.
  const keyClick = useCallback(
    cell => send({ type: 'KEYBOARD.CELL.CLICK', cell }),
    [send],
  );

  return (
    <SVGGrid rows={layout.rows} cols={layout.cols} className={className}>
      {layout.cells.map(cell => {
        const reachable =
          rootCell !== undefined && layout.isReachable(rootCell, cell);
        const selectable = reachable || cell.isRoot;
        const selected =
          layout.hasSeparateRoots && cell.isRoot
            ? cell.pitchClass === selectedChord?.root
            : reachable && selectedChord?.includes(cell.pitchClass);
        return {
          col: cell.col,
          row: cell.row,
          layers: {
            single: (
              <KbKey
                cell={cell}
                onClick={keyClick}
                selected={selected}
                selectable={selectable && !disabled}
              />
            ),
          },
        };
      })}
    </SVGGrid>
  );
};

export default Keyboard;

export type KbKeyProps = {
  cell: KeyboardCell;
  role?: 'root' | FactorName;
  selectable?: boolean;
  selected?: boolean;
  onClick?: (cell: KeyboardCell) => void;
};

export const KbKey: React.FC<KbKeyProps> = React.memo(props => {
  const { cell, role, selectable, selected, onClick } = props;
  const { pitchClass } = cell;

  return (
    <NoteKey
      pitchClass={pitchClass}
      root={role === 'root'}
      selected={selected}
      selectable={selectable}
      showAs={selected || selectable ? 'expanded' : 'collapsed'}
      onClick={onClick?.bind(undefined, cell)}
    />
  );
});
