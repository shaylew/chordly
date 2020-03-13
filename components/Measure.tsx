import React from 'react';

export type MeasureProps = {
  selected?: boolean;
};

export const Measure: React.FC<MeasureProps> = props => {
  const { selected = false } = props;
  return (
    <div className={selected ? 'selected' : ''}>
      {props.children}
      <style jsx>{`
        div {
          flex: 1;
          display: flex;
          justify-content: space-evenly;
          background-color: #111;
          border: solid #ddd 1px;
        }
        div.selected {
          background-color: #222;
        }
        div:first-child {
          border-left: double #ddd 3px;
        }
        div:last-child {
          border-right-style: double #ddd 3px;
        }
      `}</style>
    </div>
  );
};

export default Measure;
