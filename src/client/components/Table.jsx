import React from 'react';

export const Table = ({ children }) => (
  <div className="table__container">
    <table className="table">
      { children }
    </table>
  </div>
);
