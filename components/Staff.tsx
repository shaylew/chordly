import React from 'react';

export type StaffProps = {};

export const Staff: React.FC<StaffProps> = props => {
  return (
    <div>
      {props.children}
      <style jsx>{`
        div {
          display: flex;
          flex-flow: row wrap;
          height: 3em;
          margin: 1em; 0;
        }
      `}</style>
    </div>
  );
};

export default Staff;
