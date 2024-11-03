import React from 'react';

function ProdHeader() {
  return (
    <header style={{ backgroundColor: 'lightgreen', padding: '10px', display: 'flex', justifyContent: 'flex-end' }}>
      <button onClick={() => window.open('/dev', '_blank')}>Switch to DEV</button>
    </header>
  );
}

export default ProdHeader;
