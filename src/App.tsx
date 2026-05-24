import { Feed } from '@/components/feed/Feed';
import { generateDataset } from '@/data/generate';

const DATASET = generateDataset(2000);

function App() {
  return <Feed items={DATASET} targetRowHeight={220} gap={4} />;
}

export default App;
