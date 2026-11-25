import * as SQLite from 'expo-sqlite';

export type Album = {
  id: number;
  titulo: string;
  artista: string;
  ano: number;
  genero: string;
  capa: string | null;
};

export type AlbumInput = Omit<Album, 'id' | 'capa'> & {
  capa?: string | null;
};

const seedAlbuns: AlbumInput[] = [
  {
    titulo: 'Taylor Swift',
    artista: 'Taylor Swift',
    ano: 2006,
    genero: 'Country',
    capa: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/d0/f1/e0/d0f1e04e-a58c-7dc8-15d2-79c62dd94e5a/06PNDIM00825.rgb.jpg/100x100bb.jpg',
  },
  {
    titulo: 'Fearless (Taylor’s Version)',
    artista: 'Taylor Swift',
    ano: 2021,
    genero: 'Country Pop',
    capa: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c3/d0/1c/c3d01c88-73e7-187e-fd62-e1744de979a6/21UMGIM09915.rgb.jpg/100x100bb.jpg',
  },
  {
    titulo: 'Speak Now (Taylor’s Version)',
    artista: 'Taylor Swift',
    ano: 2023,
    genero: 'Pop Rock',
    capa: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/9f/3c/0a/9f3c0a60-f9e0-a34e-60e5-0be1f182896b/23UMGIM63932.rgb.jpg/100x100bb.jpg',
  },
  {
    titulo: 'Red (Taylor’s Version)',
    artista: 'Taylor Swift',
    ano: 2021,
    genero: 'Pop / Country Rock',
    capa: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/c6/27/9c/c6279c07-9329-827d-31c4-f5d4c7d99ff4/21UM1IM25046.rgb.jpg/100x100bb.jpg',
  },
  {
    titulo: '1989 (Taylor’s Version)',
    artista: 'Taylor Swift',
    ano: 2023,
    genero: 'Synth-pop',
    capa: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/8e/35/6c/8e356cc2-0be4-b83b-d29e-b578623df2ac/23UM1IM34052.rgb.jpg/100x100bb.jpg',
  },
  {
    titulo: 'reputation',
    artista: 'Taylor Swift',
    ano: 2017,
    genero: 'Electropop',
    capa: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/eb/e6/06/ebe606da-e00f-82d3-47f3-b79904eed541/17UM1IM24651.rgb.jpg/100x100bb.jpg',
  },
  {
    titulo: 'Lover',
    artista: 'Taylor Swift',
    ano: 2019,
    genero: 'Pop',
    capa: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/100x100bb.jpg',
  },
  {
    titulo: 'folklore',
    artista: 'Taylor Swift',
    ano: 2020,
    genero: 'Indie Folk',
    capa: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/7c/04/ba/7c04ba17-2ff8-21b3-0ac0-7d141f86e924/20UMGIM64216.rgb.jpg/100x100bb.jpg',
  },
  {
    titulo: 'evermore',
    artista: 'Taylor Swift',
    ano: 2020,
    genero: 'Alternative / Folk',
    capa: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/82/33/6e/82336ed3-3d1b-e920-b0a7-61775acd0f33/20UM1IM14847.rgb.jpg/100x100bb.jpg',
  },
  {
    titulo: 'Midnights',
    artista: 'Taylor Swift',
    ano: 2022,
    genero: 'Synth-pop',
    capa: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/67/b5/01/67b501d5-362e-797e-7dbd-942b9e273084/22UM1IM24801.rgb.jpg/100x100bb.jpg',
  },
  {
    titulo: 'THE TORTURED POETS DEPARTMENT',
    artista: 'Taylor Swift',
    ano: 2024,
    genero: 'Synth-pop / Chamber Pop',
    capa: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/6b/7d/61/6b7d61e4-e6f1-83bc-d645-463aa06b33c4/24UMGIM29563.rgb.jpg/100x100bb.jpg',
  },
  {
    titulo: 'The Life of a Showgirl',
    artista: 'Taylor Swift',
    ano: 2025,
    genero: 'Pop',
    capa: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/30/0c/5a/300c5a57-d3be-a170-f880-f63380ca6312/25UM1IM19577.rgb.jpg/100x100bb.jpg',
  },
];

const legacySeedAlbuns = [
  { titulo: 'Lover', artista: 'Taylor Swift', ano: 2019, genero: 'Pop' },
  { titulo: '1989', artista: 'Taylor Swift', ano: 2014, genero: 'Synth-pop' },
  { titulo: 'Future Nostalgia', artista: 'Dua Lipa', ano: 2020, genero: 'Dance-pop' },
  { titulo: 'Renaissance', artista: 'Beyoncé', ano: 2022, genero: 'Dance-pop' },
  { titulo: 'Brat', artista: 'Charli XCX', ano: 2024, genero: 'Hyperpop' },
  { titulo: 'SOUR', artista: 'Olivia Rodrigo', ano: 2021, genero: 'Pop rock' },
  { titulo: 'Teenage Dream', artista: 'Katy Perry', ano: 2010, genero: 'Dance-pop' },
  { titulo: '1989 (Taylor’s Version)', artista: 'Taylor Swift', ano: 2023, genero: 'Synth-pop' },
  { titulo: 'thank u, next', artista: 'Ariana Grande', ano: 2019, genero: 'Pop/R&B' },
  { titulo: 'The Fame', artista: 'Lady Gaga', ano: 2008, genero: 'Electropop' },
  {
    titulo: 'When We All Fall Asleep, Where Do We Go?',
    artista: 'Billie Eilish',
    ano: 2019,
    genero: 'Electropop',
  },
  { titulo: 'Loud', artista: 'Rihanna', ano: 2010, genero: 'Dance-pop' },
];

export async function Banco(): Promise<SQLite.SQLiteDatabase> {
  return SQLite.openDatabaseAsync('catalogo_pop.db');
}

export async function createTable(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS albuns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      artista TEXT NOT NULL,
      ano INTEGER NOT NULL,
      genero TEXT NOT NULL
    );
  `);

  try {
    await db.execAsync('ALTER TABLE albuns ADD COLUMN capa TEXT');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.toLowerCase().includes('duplicate column name: capa')) {
      throw error;
    }
  }

  await db.withTransactionAsync(async () => {
    const count = await countAlbuns(db);

    if (count === 0) {
      for (const album of seedAlbuns) {
        await insertAlbum(db, album);
      }
      return;
    }

    let hasLegacyWithoutCover = false;
    for (const album of legacySeedAlbuns) {
      const existing = await db.getFirstAsync<{ id: number }>(
        `SELECT id FROM albuns
         WHERE titulo = ? AND artista = ? AND ano = ? AND genero = ?
         AND (capa IS NULL OR TRIM(capa) = '')
         LIMIT 1`,
        album.titulo,
        album.artista,
        album.ano,
        album.genero
      );
      if (existing) {
        hasLegacyWithoutCover = true;
        break;
      }
    }

    if (!hasLegacyWithoutCover) return;

    for (const album of legacySeedAlbuns) {
      await db.runAsync(
        `DELETE FROM albuns
         WHERE titulo = ? AND artista = ? AND ano = ? AND genero = ?
         AND (capa IS NULL OR TRIM(capa) = '')`,
        album.titulo,
        album.artista,
        album.ano,
        album.genero
      );
    }

    for (const album of seedAlbuns) {
      const existing = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM albuns WHERE titulo = ? AND artista = ? ORDER BY id LIMIT 1',
        album.titulo,
        album.artista
      );

      if (existing) {
        await db.runAsync(
          'UPDATE albuns SET capa = ? WHERE id = ? AND (capa IS NULL OR TRIM(capa) = \'\')',
          album.capa ?? null,
          existing.id
        );
      } else {
        await insertAlbum(db, album);
      }
    }
  });
}

export async function selectAlbuns(
  db: SQLite.SQLiteDatabase,
  page: number,
  pageSize = 4
): Promise<Album[]> {
  const offset = (page - 1) * pageSize;
  return db.getAllAsync<Album>(
    'SELECT id, titulo, artista, ano, genero, capa FROM albuns ORDER BY id DESC LIMIT ? OFFSET ?',
    pageSize,
    offset
  );
}

export async function countAlbuns(db: SQLite.SQLiteDatabase): Promise<number> {
  const result = await db.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) AS total FROM albuns'
  );
  return result?.total ?? 0;
}

export async function insertAlbum(
  db: SQLite.SQLiteDatabase,
  album: AlbumInput
): Promise<void> {
  await db.runAsync(
    'INSERT INTO albuns (titulo, artista, ano, genero, capa) VALUES (?, ?, ?, ?, ?)',
    album.titulo,
    album.artista,
    album.ano,
    album.genero,
    album.capa ?? null
  );
}

export async function updateAlbum(
  db: SQLite.SQLiteDatabase,
  id: number,
  album: AlbumInput
): Promise<void> {
  await db.runAsync(
    'UPDATE albuns SET titulo = ?, artista = ?, ano = ?, genero = ?, capa = ? WHERE id = ?',
    album.titulo,
    album.artista,
    album.ano,
    album.genero,
    album.capa ?? null,
    id
  );
}

export async function deleteAlbum(
  db: SQLite.SQLiteDatabase,
  id: number
): Promise<void> {
  await db.runAsync('DELETE FROM albuns WHERE id = ?', id);
}
