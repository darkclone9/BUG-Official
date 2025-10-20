/**
 * Database Backup Script
 * 
 * Creates a full backup of the Firestore database before migration.
 * Exports all collections to JSON files for safekeeping.
 * 
 * Usage:
 *   npx ts-node scripts/backupDatabase.ts
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: serviceAccountKey.json not found!');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

interface BackupStats {
  timestamp: string;
  collections: Record<string, number>;
  totalDocuments: number;
  backupPath: string;
}

async function backupDatabase(): Promise<void> {
  console.log('🔄 Starting database backup...\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '..', 'backups', timestamp);

  // Create backup directory
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const stats: BackupStats = {
    timestamp,
    collections: {},
    totalDocuments: 0,
    backupPath: backupDir,
  };

  try {
    // Get all collections
    const collectionsSnapshot = await db.listCollections();
    const collections = collectionsSnapshot.map(col => col.id);

    console.log(`📦 Found ${collections.length} collections to backup:\n`);

    for (const collectionName of collections) {
      console.log(`  📄 Backing up: ${collectionName}...`);

      const collectionRef = db.collection(collectionName);
      const snapshot = await collectionRef.get();
      const documents: any[] = [];

      snapshot.forEach(doc => {
        documents.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Save collection to JSON file
      const filePath = path.join(backupDir, `${collectionName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(documents, null, 2));

      stats.collections[collectionName] = documents.length;
      stats.totalDocuments += documents.length;

      console.log(`     ✅ Backed up ${documents.length} documents`);
    }

    // Save backup metadata
    const metadataPath = path.join(backupDir, 'backup-metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(stats, null, 2));

    console.log(`\n✅ Backup completed successfully!\n`);
    console.log(`📊 Backup Statistics:`);
    console.log(`   Total Collections: ${collections.length}`);
    console.log(`   Total Documents: ${stats.totalDocuments}`);
    console.log(`   Backup Location: ${backupDir}`);
    console.log(`   Timestamp: ${timestamp}\n`);

    console.log(`💾 Backup files saved to: ${backupDir}`);
    console.log(`\n⚠️  IMPORTANT: Store this backup securely for 90 days minimum!`);

  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

// Run backup
backupDatabase().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

