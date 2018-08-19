import Dexie from 'dexie';

const db = new Dexie('popupsearch');
db.version(1).stores({
  keywords: '++id, &name, timestamp',
  results: '++id, *keyword, *search_engine, results_json_str, last_scrolling_position',
  visitedlinks: '++id, *link, *search_keyword, timestamp',
});

db.version(2).stores({
  keywords: '++id, &name, *timestamp',
  results: '++id, *keyword, *search_engine, results_json_str, last_scrolling_position',
  visitedlinks: '++id, *link, *search_keyword, *timestamp',
});

if (typeof window !== 'undefined') {
  window.db = db;
}

export default db;
