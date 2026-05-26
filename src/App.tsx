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
      <div className="density-control">
        <span className="density-label">Compact</span>
        <input
          type="range"
          min={MIN_COLUMNS}
          max={MAX_COLUMNS}
          step={1}
          value={targetColumns}
          onChange={(e) => setTargetColumns(Number(e.target.value))}
          className="density-slider"
        />
        <span className="density-label">Spacious</span>
      </div>
      <Feed items={DATASET} targetColumns={targetColumns} gap={4} />
    </>
  );
}

export default App;
