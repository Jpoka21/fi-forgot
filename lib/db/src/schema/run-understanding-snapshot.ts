import { readFile } from 'node:fs/promises';
// Deliberate rollout tool; importing or invoking without --apply never opens a DB.
if(process.argv.includes('--apply')) {
 const {pool}=await import('../index');
 const client=await pool.connect();
 try {
  await client.query('BEGIN');
  await client.query(await readFile(new URL('./versioned-understanding-snapshot.sql',import.meta.url),'utf8'));
  await client.query('COMMIT');
 } catch(error) {await client.query('ROLLBACK');throw error;}
 finally {client.release();await pool.end();}
} else {
 console.log('No database accessed. An authorized rollout may invoke this script with --apply after schema review.');
}
