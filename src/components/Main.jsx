import React from 'react';

const Main = ({ children }) => {
  return (
    <main style={{ flex: 1, padding: '20px' }}>
      {children}
    </main>
  );
};

export default Main;
