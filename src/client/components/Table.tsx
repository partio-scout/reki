import React from 'react';

export const Table: React.FC = ({ children }) => (
  <div className="table__container">
    <table className="table">
      { children }
    </table>
  </div>
);
