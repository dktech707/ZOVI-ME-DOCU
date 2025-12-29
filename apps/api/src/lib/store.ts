import fs from 'node:fs';
import path from 'node:path';

type DB = {
  categories: any[];
  jobRequests: any[];
  offers: any[];
  bookings: any[];
};

const defaultDb: DB = { categories: [], jobRequests: [], offers: [], bookings: [] };

export function loadDb(dataPath: string): DB {
  const abs = path.resolve(dataPath);
  const dir = path.dirname(abs);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (!fs.existsSync(abs)) {
    // initialize from seed if available
    const seedPath = path.resolve(process.cwd(), 'data/seed.json');
    const seed = fs.existsSync(seedPath) ? JSON.parse(fs.readFileSync(seedPath, 'utf-8')) : defaultDb;
    fs.writeFileSync(abs, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }
  return JSON.parse(fs.readFileSync(abs, 'utf-8'));
}

export function saveDb(dataPath: string, db: DB): void {
  const abs = path.resolve(dataPath);
  fs.writeFileSync(abs, JSON.stringify(db, null, 2), 'utf-8');
}
