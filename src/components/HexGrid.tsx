import React from 'react';
import clsx from 'clsx';
import {
  createStyles,
  WithStyles,
  withStyles,
  makeStyles,
} from '@material-ui/core';

import '../images/shapes.svg';

export const hexagonHeight = Math.sqrt(3);
export const hexagonAspectRatio = hexagonHeight / 2;

const shapeStyles = createStyles({
  root: {},
  hexagonEdge: {
    // vectorEffect: 'non-scaling-stroke',
    stroke: 'none',
    fill: 'none',
  },
  hexagon: {
    // vectorEffect: 'non-scaling-stroke',
    stroke: 'none',
    fill: 'none',
  },
  hexagonOverlay: {
    // vectorEffect: 'non-scaling-stroke',
    stroke: 'none',
    fill: 'none',
  },
  allHexagons: {},
  circle: {
    // vectorEffect: 'non-scaling-stroke',
    stroke: 'none',
    fill: 'none',
  },
  circleOverlay: {
    pointerEvents: 'none',
    stroke: 'none',
    fill: 'none',
  },
  content: {},
});

export type ShapeClasses = WithStyles<typeof shapeStyles>;
export type ShapeProps = React.ComponentProps<'g'>;
type AllShapeProps = ShapeClasses & ShapeProps;

const ShapeRaw: React.FC<AllShapeProps> = props => {
  const { className, classes, ...rest } = props;

  return (
    <g className={clsx([classes.root, className])} {...rest}>
      <use
        href="#shapes_hexagon"
        clipPath="url(#shapes_hexagonClip)"
        className={clsx(classes.allHexagons, classes.hexagon)}
      />
      <use
        href="#shapes_hexagon"
        clipPath="url(#shapes_hexagonClip)"
        className={clsx(classes.allHexagons, classes.hexagonOverlay)}
      />
      <use
        href="#shapes_circle"
        clipPath="url(#shapes_circleClip)"
        className={classes.circle}
      />
      <use
        href="#shapes_circle"
        clipPath="url(#shapes_circleClip)"
        className={clsx(classes.circle, classes.circleOverlay)}
      />
      <g clipPath="url(#shapes_hexagonClip)" className={classes.content}>
        {props.children}
      </g>
      <use
        href="#shapes_hexagon"
        className={clsx(classes.allHexagons, classes.hexagonEdge)}
      />
    </g>
  );
};

export const Shape = withStyles(shapeStyles)(ShapeRaw);

const useGridStyles = makeStyles({
  wrapper: {
    height: '100%',
    width: '100%',
    position: 'relative',
  },
  layerSvg: {
    display: 'block',
    position: 'absolute',
    // top: 0,
    // left: 0,
    // bottom: 0,
    // right: 0,
    height: '100%',
    width: '100%',
    pointerEvents: 'none',
    willChange: 'opacity',
  },
  spacerSvg: {
    display: 'none',
    height: '100%',
    width: 'auto',
  },
});

export type SVGGridChild = {
  row: number;
  col: number;
  layers: Record<string, JSX.Element>;
};

export type SVGGridProps = {
  rows: number;
  cols: number;
  children: SVGGridChild[];
  layerOrder?: string[];
} & React.ComponentProps<'svg'>;

export const SVGGrid: React.FC<SVGGridProps> = props => {
  const { rows, cols, children, ...rest } = props;

  const classes = useGridStyles();

  const xstride = 3 / 4;
  const ystride = Math.sqrt(3) / 2;

  const x0 = -xstride;
  const y0 = -ystride * 0.5;
  const w = (cols + 1) * xstride;
  const h = (rows + 0.5) * ystride;
  const viewBox = `${x0} ${y0} ${w} ${h}`;

  const byLayer: Record<string, JSX.Element[]> = {};
  children.forEach(({ row, col, layers }) => {
    for (const layer in layers) {
      const x = xstride * col;
      const y = ystride * row;
      const el = (
        <g key={`${row}-${col}`} transform={`translate(${x} ${y})`}>
          {layers[layer]}
        </g>
      );
      byLayer[layer] = byLayer[layer] || [];
      byLayer[layer].push(el);
    }
  });

  const layerOrder = props.layerOrder || Object.keys(byLayer);
  const svgLayers = layerOrder.map(layer => {
    const items = byLayer[layer];
    return !items ? null : (
      <svg
        key={layer}
        className={classes.layerSvg}
        preserveAspectRatio="xMidYMid meet"
        viewBox={viewBox}
      >
        {items}
      </svg>
    );
  });

  return (
    <div className={classes.wrapper}>
      {/* <svg
        className={classes.spacerSvg}
        preserveAspectRatio="xMidYMid meet"
        viewBox={viewBox}
        {...rest}
      ></svg> */}
      {svgLayers}
    </div>
  );
};
