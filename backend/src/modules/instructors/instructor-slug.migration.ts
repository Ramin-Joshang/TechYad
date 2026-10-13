import { User } from '../auth/user.model.js';
import { InstructorProfile } from './instructor-profile.model.js';
import { Role } from '../auth/role.model.js';

/**
 * Migration helper to ensure all instructors and users have valid English slugs
 * and critical administrators have verified phone status.
 */
export async function ensureInstructorSlugsAndVerification() {
  try {
    // 1. Known instructor English slug mappings
    const knownInstructorSlugs: Record<string, string> = {
      'محمدحسین-اسلامی-تبار': 'mohammadhossein-eslamitabar',
      'محمدحسین اسلامی تبار': 'mohammadhossein-eslamitabar',
      'امیر-رمضان': 'amir-ramezan',
      'امیر رمضان': 'amir-ramezan',
    };

    // Find all instructor profiles
    const profiles = await InstructorProfile.find({}).populate('userId');

    for (const profile of profiles) {
      const u = profile.userId as any;
      let targetSlug = profile.slug;

      // Check known mappings first
      if (targetSlug && knownInstructorSlugs[targetSlug]) {
        targetSlug = knownInstructorSlugs[targetSlug];
      } else if (u && (`${u.firstName} ${u.lastName}`.trim() === 'محمدحسین اسلامی تبار' || `${u.firstName}-${u.lastName}`.trim() === 'محمدحسین-اسلامی-تبار')) {
        targetSlug = 'mohammadhossein-eslamitabar';
      } else if (u && (`${u.firstName} ${u.lastName}`.trim() === 'امیر رمضان' || `${u.firstName}-${u.lastName}`.trim() === 'امیر-رمضان')) {
        targetSlug = 'amir-ramezan';
      } else if (!targetSlug || /[\u0600-\u06FF]/.test(targetSlug)) {
        // Persian or missing slug -> generate clean English slug
        if (u?.email) {
          targetSlug = u.email.split('@')[0].toLowerCase().replace(/[^a-z0-9-]/g, '-');
        } else if (u?._id) {
          targetSlug = `instructor-${u._id.toString().slice(-6)}`;
        } else {
          targetSlug = `instructor-${profile._id.toString().slice(-6)}`;
        }
      }

      // Ensure lowercase English characters
      const finalSlug = (targetSlug || `instructor-${profile._id.toString().slice(-6)}`)
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      // Update InstructorProfile slug
      if (profile.slug !== finalSlug) {
        profile.slug = finalSlug;
        await profile.save();
        console.log(`[Migration] Updated InstructorProfile slug: ${profile._id} -> ${finalSlug}`);
      }

      // Update corresponding User record
      if (u?._id) {
        await User.findByIdAndUpdate(u._id, {
          $set: {
            slug: finalSlug,
            mobileVerified: true // Ensure existing approved instructors are verified
          }
        });
      }
    }

    // 2. Ensure all Super Admins and Admins have mobileVerified: true
    const adminRoles = await Role.find({ slug: { $in: ['super-admin', 'admin'] } }).select('_id');
    if (adminRoles.length > 0) {
      const adminRoleIds = adminRoles.map(r => r._id);
      await User.updateMany(
        { role: { $in: adminRoleIds }, mobileVerified: { $ne: true } },
        { $set: { mobileVerified: true } }
      );
    }

    // 3. Ensure any instructor user without a profile gets an English slug
    const instructorRole = await Role.findOne({ slug: 'instructor' });
    if (instructorRole) {
      const instructorUsers = await User.find({ role: instructorRole._id });
      for (const instUser of instructorUsers) {
        if (!instUser.slug || /[\u0600-\u06FF]/.test(instUser.slug)) {
          let genSlug = 'instructor-' + instUser._id.toString().slice(-6);
          if (instUser.email) {
            genSlug = instUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9-]/g, '-');
          }
          await User.findByIdAndUpdate(instUser._id, {
            $set: { slug: genSlug, mobileVerified: true }
          });
        }
      }
    }

    console.log('✅ Instructor English slugs & admin verification migration check completed.');
  } catch (err: any) {
    console.error('Error in ensureInstructorSlugsAndVerification:', err.message);
  }
}
