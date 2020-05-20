import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core';

export const hexagonHeight = Math.sqrt(3);
export const hexagonAspectRatio = hexagonHeight / 2;

const hexagonClipUrl = 'url(#hexagonClip)';

export type HexagonProps = {
  clipped?: boolean;
} & React.ComponentProps<'use'>;

export const Hexagon: React.FC<HexagonProps> = props => {
  const { clipped, ...rest } = props;
  return (
    <use
      href="#hexagon"
      clipPath={clipped ? hexagonClipUrl : undefined}
      {...rest}
    />
  );
};

const useGridStyles = makeStyles({
  wrapper: {
    height: '100%',
    width: '100%',
    position: 'relative',
  },
  defs: {
    position: 'absolute',
    height: 0,
    width: 0,
    // display: 'none',
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

  const x0 = 0;
  const y0 = 0;
  const w = xstride * cols;
  const h = ystride * (rows + 0.5);
  const viewBox = `${x0} ${y0} ${w} ${h}`;

  const byLayer: Record<string, JSX.Element[]> = {};
  children.forEach(({ row, col, layers }) => {
    for (const layer in layers) {
      const x = xstride * (col + 0.5);
      const y = ystride * (row + 0.5);
      const el = (
        <g key={`${row}-${col}`} transform={`translate(${x}, ${y})`}>
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
      <svg className={classes.defs} viewBox="-0.5 -0.5 1 1">
        <defs>
          <polygon
            id="hexagon"
            points="-0.5,0 -0.25,0.433 0.25,0.433 0.5,0 0.25,-0.433 -0.25,-0.433 -0.5,0"
            vectorEffect="non-scaling-stroke"
          />
          <clipPath id="hexagonClip" clipPathUnits="userSpaceOnUse">
            <polygon points="-0.5 0, -0.25 0.433, 0.25 0.433, 0.5 0, 0.25 -0.433, -0.25 -0.433, -0.5 0" />
          </clipPath>
        </defs>
      </svg>
      {svgLayers}
    </div>
  );
};
