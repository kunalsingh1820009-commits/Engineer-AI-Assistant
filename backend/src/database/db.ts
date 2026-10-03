import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbFilePath = path.resolve(dataDir, 'engineer_ai.sqlite');

let sqlJsDb: SqlJsDatabase | null = null;

export async function getDbInstance(): Promise<SqlJsDatabase> {
  if (sqlJsDb) return sqlJsDb;

  const SQL = await initSqlJs();
  if (fs.existsSync(dbFilePath)) {
    const fileBuffer = fs.readFileSync(dbFilePath);
    sqlJsDb = new SQL.Database(fileBuffer);
  } else {
    sqlJsDb = new SQL.Database();
    persistDatabase();
  }
  return sqlJsDb;
}

export function persistDatabase(): void {
  if (!sqlJsDb) return;
  try {
    const data = sqlJsDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbFilePath, buffer);
  } catch (err) {
    console.error('Failed to persist SQLite database to disk:', err);
  }
}

/**
 * Clean Synchronous-like Database Interface Wrapper
 */
export class DatabaseWrapper {
  private getDB(): SqlJsDatabase {
    if (!sqlJsDb) {
      throw new Error('Database not initialized yet. Call initDatabase() first.');
    }
    return sqlJsDb;
  }

  exec(sql: string): void {
    this.getDB().run(sql);
    persistDatabase();
  }

  prepare(sql: string) {
    const self = this;
    return {
      get(...params: any[]) {
        const stmt = self.getDB().prepare(sql);
        try {
          stmt.bind(params.map(p => (p === undefined ? null : p)));
          if (stmt.step()) {
            return stmt.getAsObject();
          }
          return undefined;
        } finally {
          stmt.free();
        }
      },
      all(...params: any[]) {
        const stmt = self.getDB().prepare(sql);
        const results: any[] = [];
        try {
          stmt.bind(params.map(p => (p === undefined ? null : p)));
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          return results;
        } finally {
          stmt.free();
        }
      },
      run(...params: any[]) {
        const stmt = self.getDB().prepare(sql);
        try {
          stmt.run(params.map(p => (p === undefined ? null : p)));
          persistDatabase();
          return { changes: 1 };
        } finally {
          stmt.free();
        }
      }
    };
  }
}

export const db = new DatabaseWrapper();
export default db;
