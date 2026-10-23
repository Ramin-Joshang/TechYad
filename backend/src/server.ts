import app from './app.js';
import { connectDB } from './config/database.js';
import { env } from './config/env.js';
import { cleanupAllBase64FromDatabase } from './modules/media/cleanupBase64.js';
import { ensureInstructorSlugsAndVerification } from './modules/instructors/instructor-slug.migration.js';
import { AccountingLedgerService } from './modules/accounting/accounting-ledger.service.js';
import { PlatformLocksService } from './common/services/platform-locks.service.js';

const startServer = async () => {
  // 1. Connect to Database
  await connectDB();
  await PlatformLocksService.init();

  // 2. Automatically clean & migrate any legacy base64 data to disk files
  cleanupAllBase64FromDatabase().catch(err => {
    console.error('Failed to cleanup base64 data:', err);
  });

  // 3. Ensure all instructors have English slugs and administrators have verified status
  ensureInstructorSlugsAndVerification().catch(err => {
    console.error('Failed to migrate instructor slugs:', err);
  });

  // 4. Ensure Standard Double-Entry Chart of Accounts exists
  AccountingLedgerService.ensureChartOfAccounts().then(res => {
    console.log(`✅ Accounting Chart of Accounts initialized: ${res.total} accounts ready`);
  }).catch(err => {
    console.error('Failed to ensure Chart of Accounts:', err);
  });

  // 5. Ensure partner, accountant, multi-role structure and user backward compatibility
  import('./modules/auth/role.migration.js').then(({ ensureRolesAndMultiRoleMigration }) => {
    ensureRolesAndMultiRoleMigration().then(res => {
      console.log(`✅ Roles & Multi-Role Migration verified: ${res.rolesCreated.length} roles created, ${res.usersMigrated} users backfilled`);
    }).catch(err => {
      console.error('Failed to run roles migration:', err);
    });
  });

  // 3. Start Express Server
  const server = app.listen(env.PORT, () => {
    console.log(`✅ Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  // 3. Handle unhandled rejections globally
  process.on('unhandledRejection', (err: Error) => {
    console.error('❌ UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();
