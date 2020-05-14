import React, { useCallback } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core';

import { PitchClass, prettyName, pcToName } from '../types';
import { FactorName, Key } from '../lib/music-theory';
import { useNoteColors } from '../lib/colors';
import { Hexagon, SVGGrid } from './HexGrid';
import { KeyboardCell } from '../lib/keyboard-layout';
import { KeyboardEvent, KeyboardContext } from '../machines/keyboard';
import { Send } from '../machines/types';

export type Emphasis = undefined | 'low' | 'medium' | 'high';
export type EmphasisLevels = Partial<Record<PitchClass, Emphasis>>;

export type NoteKeyProps = {
  pitchClass: PitchClass; // the note this key plays
  label?: string; // what the key says
  role?: 'root' | FactorName;
  isRoot?: boolean; // is this key on the bottom tier
  inKey?: boolean; // is this note in the current key (if any)
  selected?: boolean; // is this note a selected chord part
  selectable?: boolean; // is this note interactable
  emphasis?: Emphasis;
  showAs?: 'ghost' | 'collapsed' | 'expanded';
  onClick?: React.MouseEventHandler;
};

const delayFactor = 1;
const transitionFactor = 1;
function standardTransition(delayTime = 0, transitionTime = 0.5): string {
  const transition = transitionTime * transitionFactor;
  const delay = delayTime * delayFactor;
  return [
    `transform ${transition}s ease-out ${delay}s`,
    `opacity ${transition}s ease-out ${delay}s`,
  ].join(', ');
}

const useKeyStyles = makeStyles({
  wrapper: {},
  selectable: {
    '& $border': {
      opacity: 0.35,
    },
    '& $color': {
      opacity: 0,
    },
    '&:hover $border': {
      opacity: 0.8,
    },
    '& $content': {
      opacity: 1,
    },
  },
  selected: {
    '& $color': {
      opacity: 1,
    },
    '& $border': {
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
  ghost: {},
  collapsed: {},
  inKey: {},
  notInKey: {},
  root: {
    transition: standardTransition(0),
    '& $border': {
      opacity: 0.35,
    },
    '& $key': {
      opacity: 1,
    },
  },
  third: {
    transition: standardTransition(0.1),
  },
  fifth: {
    transition: standardTransition(0.2),
  },
  seventh: {
    transition: standardTransition(0.3),
  },
  ninth: {
    transition: standardTransition(0.4),
  },
  eleventh: {
    transition: standardTransition(0.5),
  },
  background: {
    fill: '#BBB',
  },
  key: {
    opacity: 0.25,
    fill: 'white',
    '$notInKey &': {
      fill: '#111',
    },
  },
  color: {
    opacity: 0,
    transition: 'inherit',
    fill: 'var(--note-color-200)',
  },
  border: {
    transition: standardTransition(),
    opacity: 0,
    willChange: 'opacity',
    strokeWidth: '6px',
    stroke: 'black',
    fill: 'none',
  },
  edge: {
    fill: 'none',
    stroke: 'white',
    strokeWidth: '2px',
  },
  content: {
    opacity: 0,
    transition: 'inherit',
    cursor: 'pointer',
    userSelect: 'none',
    '$selectable &': {
      pointerEvents: 'visibleFill',
    },
  },
  label: {
    fontSize: '0.33px', // svg pixels
    textAnchor: 'middle',
    letterSpacing: 'normal',
    fill: 'black',
    '$selected &': {
      fill: 'var(--note-color-900)',
    },
    '$notInKey$root:not($selected) &': {
      fill: 'white',
    },
  },
});

const NoteKey: React.FC<NoteKeyProps> = props => {
  const {
    pitchClass,
    onClick,
    role = 'third',
    // isRoot = false,
    selected = false,
    selectable = false,
    showAs = 'expanded',
    inKey = true,
    label = prettyName(pcToName(pitchClass)),
  } = props;

  const colors = useNoteColors();
  const classes = useKeyStyles();

  const colorClass = colors[`note-${pitchClass}`];

  return (
    <g
      className={clsx(colorClass, classes.wrapper, classes[role], {
        [classes.expanded]: showAs === 'expanded',
        [classes.collapsed]: showAs === 'collapsed',
        [classes.ghost]: showAs === 'ghost',
        [classes.selected]: selected,
        [classes.selectable]: selectable,
        [classes.inKey]: inKey,
        [classes.notInKey]: !inKey,
      })}
    >
      <Hexagon className={classes.background} />
      <Hexagon clipped className={classes.key} />
      <Hexagon clipped className={classes.color} />
      <Hexagon clipped className={classes.border} />
      <Hexagon className={classes.edge} />

      <g
        onMouseDown={onClick}
        clipPath="url(shapes_hexagonClip)"
        className={classes.content}
      >
        <circle cx={0} cy={0} r={0.5} fill="none" />
        <text x="0" y="0.125" className={classes.label}>
          {label}
        </text>
      </g>
    </g>
  );
};

export type KeyboardProps = {
  send?: Send<KeyboardEvent>;
  context: KeyboardContext;
  disabled?: boolean;
  className?: string;
};

export const KeyboardRaw: React.FC<KeyboardProps> = props => {
  const { send, context, disabled, className } = props;
  const { layout, chord, keySignature, root: rootCell } = context;

  // You may be asking yourself: is all this memoization worth it?
  // The answer is yes, rerendering 80ish keys worth of nested svg
  // does negatively impact the user experience, so we avoid it.
  const keyClick = useCallback(
    cell => send && send({ type: 'KEYBOARD.CELL.CLICK', cell }),
    [send],
  );

  return (
    <SVGGrid rows={layout.rows} cols={layout.cols} className={className}>
      {layout.cells.map(cell => {
        const relationship = rootCell
          ? layout.relationship(rootCell, cell)
          : undefined;
        const reachable = !!relationship;
        const selectable = reachable || cell.isRoot;
        const selected =
          layout.hasSeparateRoots && cell.isRoot
            ? cell.pitchClass === chord?.root
            : cell === rootCell ||
              (reachable && chord?.includes(cell.pitchClass));
        const actualRole = selected ? relationship?.factorName : undefined;
        const possibleRole = relationship?.factorName;
        const rootRole = cell.isRoot ? 'root' : undefined;
        const role = disabled
          ? actualRole || rootRole
          : actualRole || possibleRole || rootRole;
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
                role={role}
                isRoot={cell.isRoot}
                keySignature={keySignature}
              />
            ),
          },
        };
      })}
    </SVGGrid>
  );
};

export const Keyboard = React.memo(KeyboardRaw);

export type KbKeyProps = {
  cell: KeyboardCell;
  role?: 'root' | FactorName;
  isRoot?: boolean;
  selectable?: boolean;
  selected?: boolean;
  keySignature?: Key;
  onClick?: (cell: KeyboardCell) => void;
};

// if you want to shave off some more performance, move all the logic out of
// KbKey, split the whole thing up into layers, and render the (same,
// memoized) blank keys in the background every time. then it'll only have to
// draw the active ones on top of them and not build & diff the whole thing.

export const KbKey: React.FC<KbKeyProps> = props => {
  const {
    cell,
    role,
    isRoot,
    selectable,
    selected,
    keySignature,
    onClick,
  } = props;
  const { pitchClass } = cell;

  const inKey = !keySignature || keySignature.includes(pitchClass);
  const showAs = selected
    ? 'expanded'
    : selectable
    ? inKey
      ? 'expanded'
      : 'ghost'
    : 'collapsed';
  return (
    <NoteKey
      pitchClass={pitchClass}
      role={role}
      isRoot={isRoot}
      selected={selected}
      selectable={selectable}
      showAs={showAs}
      inKey={!keySignature || keySignature.includes(pitchClass)}
      onClick={onClick?.bind(undefined, cell)}
      label={keySignature?.noteName(pitchClass)}
    />
  );
};

export default Keyboard;
