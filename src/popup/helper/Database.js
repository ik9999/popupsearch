import Dexie from 'dexie';

const db = new Dexie('popupsearch');
db.version(1).stores({
  keywords: '++id, &name, timestamp',
  results: '++id, *keyword, *engine, resultsJsonStr',
  visitedlinks: '++id, *link, *search_keyword, timestamp',
});

export default db;
