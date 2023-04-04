import { useSearch } from './util/search';

import './App.css';
import Note from './Note';

const App = () => {
  const search = useSearch();
  if (search.mode === 'note') {
    return <Note noteId={search.id} />;
  }
  return <>Error: Unknown mode: {search.mode}</>;
};

export default App;
