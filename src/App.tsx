import { useState } from 'react';
import { Feed } from '@/components/feed/Feed';
import { generateDataset } from '@/data/generate';

const DATASET = generateDataset(2000);
const MIN_COLUMNS = 2;
const MAX_COLUMNS = 8;

function App() {
  const [targetColumns, setTargetColumns] = useState(5);

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 10,
          background: 'rgba(15,15,15,0.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ color: '#666', fontSize: 11 }}>Compact</span>
        <input
          type="range"
          min={MIN_COLUMNS}
          max={MAX_COLUMNS}
          step={1}
          value={targetColumns}
          onChange={(e) => setTargetColumns(Number(e.target.value))}
          style={{ width: 100, cursor: 'pointer' }}
        />
        <span style={{ color: '#666', fontSize: 11 }}>Spacious</span>
      </div>
      <Feed items={DATASET} targetColumns={targetColumns} gap={4} />
    </>
  );
}

export default App;
