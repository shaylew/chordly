import React from 'react';
import clsx from 'clsx';
import {
  makeStyles,
  createStyles,
  WithStyles,
  withStyles,
} from '@material-ui/core';

import '../images/shapes.svg';

export const hexagonHeight = 2 / Math.sqrt(3);

const shapeStyles = createStyles({
  root: {
    position: 'relative',
    flex: '1 1 0',
    width: '100%',
    marginTop: `${(-hexagonHeight / 4) * 100}%`,
    marginBottom: `${(-hexagonHeight / 4) * 100}%`,
    '&::before': {
      content: '""',
      display: 'block',
      paddingBottom: `${hexagonHeight * 100}%`,
    },
  },
  shapeSvg: {
    display: 'block',
    position: 'absolute',
    pointerEvents: 'none',
    top: '0',
    left: '0',
    vectorEffect: 'non-scaling-stroke',
  },
  hexagon: {
    pointerEvents: 'visible',
    strokeLinejoin: 'round',
    vectorEffect: 'non-scaling-stroke',
  },
  hexagonOverlay: {
    pointerEvents: 'none',
    opacity: 0,
    strokeLinejoin: 'round',
    vectorEffect: 'non-scaling-stroke',
  },
  circle: {
    pointerEvents: 'visible',
    strokeLinejoin: 'round',
    vectorEffect: 'non-scaling-stroke',
  },
  circleOverlay: {
    pointerEvents: 'none',
    opacity: 0,
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    clipPath: 'url(#shapes_hexagonClip)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export type ShapeClasses = WithStyles<typeof shapeStyles>;
export type ShapeProps = React.ComponentProps<'div'>;
type AllShapeProps = ShapeClasses & ShapeProps;

const ShapeRaw: React.FC<AllShapeProps> = props => {
  const { className, classes, ...rest } = props;

  return (
    <div className={clsx([classes.root, className])} {...rest}>
      <svg viewBox="-87 -100 174 200" className={classes.shapeSvg}>
        <g clipPath={`url(#shapes_hexagonClip)`}>
          <use href={`#shapes_hexagon`} className={classes.hexagon} />
          <use
            href={`#shapes_hexagon`}
            className={clsx(classes.hexagonOverlay)}
          />
        </g>
        <g clipPath={`url(#shapes_circleClip)`}>
          <use href={`#shapes_circle`} className={classes.circle} />
          <use
            href={`#shapes_circle`}
            className={clsx(classes.circle, classes.circleOverlay)}
          />
        </g>
      </svg>
      <div className={classes.content}>{props.children}</div>
    </div>
  );
};

export const Shape = withStyles(shapeStyles)(ShapeRaw);

const useHexGridStyles = makeStyles({
  grid: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    flex: '1 1 0',
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    '&::before': {
      flex: '0 0 0',
      content: '""',
      display: 'block',
      paddingBottom: `${100 / hexagonHeight}%`,
    },
  },
});

export const HexGrid: React.FC<React.ComponentProps<'div'>> = props => {
  const classes = useHexGridStyles();
  return (
    <div {...props} className={clsx([classes.grid, props.className])}>
      {props.children}
    </div>
  );
};

export const HexGridRow: React.FC = props => {
  const classes = useHexGridStyles();
  return <div className={classes.row}>{props.children}</div>;
};

export type HexRowSpacerProps = { count: number };
export const HexGridSpacer: React.FC<HexRowSpacerProps> = props => {
  return <div style={{ flex: `${props.count} ${props.count} 0` }} />;
};

export type HexGridItemProps = React.ComponentProps<'div'>;

export const HexGridItem: React.FC<HexGridItemProps> = props => {
  const { children, ...rest } = props;
  const classes = useHexGridStyles();

  return (
    <div className={classes.wrapper}>
      <div {...rest}>{children}</div>
    </div>
  );
};
