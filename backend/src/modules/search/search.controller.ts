import { Request, Response } from 'express';
import { Course } from '../courses/course.model.js';
import { Article } from '../blog/article.model.js';
import { Class } from '../classes/class.model.js';
import { InstructorProfile } from '../instructors/instructor-profile.model.js';
import { sendSuccess } from '../../common/utils/response.js';

export const globalSearch = async (req: Request, res: Response) => {
  const { q } = req.query;
  const searchTerm = typeof q === 'string' ? q.trim() : '';

  if (!searchTerm) {
    return sendSuccess(res, { courses: [], classes: [], articles: [], instructors: [] }, 'Empty search');
  }

  // Define regex for case-insensitive partial search
  const regex = new (RegExp as any)(searchTerm, 'i');

  // 1. Search Courses
  const courses = await Course.find({
    status: 'published',
    $or: [{ title: regex }, { description: regex }, { tags: regex }]
  })
    .select('title slug description price thumbnail instructors categoryId rating totalDuration')
    .populate('instructors', 'firstName lastName avatar')
    .limit(10);

  // 2. Search Classes
  const classes = await Class.find({
    status: 'published',
    $or: [{ title: regex }, { description: regex }, { location: regex }]
  })
    .select('title slug description type mode price capacity enrolledCount startDate thumbnail instructors')
    .populate('instructors', 'firstName lastName avatar')
    .limit(10);

  // 3. Search Blog Articles (note: field is authorId referencing User)
  const articles = await Article.find({
    status: 'published',
    $or: [{ title: regex }, { content: regex }, { excerpt: regex }, { tags: regex }]
  })
    .select('title slug excerpt thumbnail authorId createdAt')
    .populate('authorId', 'firstName lastName avatar')
    .limit(10);

  // 4. Search Instructors (by title, bio, specialties or user name)
  const instructorProfiles = await InstructorProfile.find({
    isApproved: true,
    $or: [
      { title: regex },
      { bio: regex },
      { specialties: regex }
    ]
  })
    .populate('userId', 'firstName lastName avatar email')
    .limit(10);

  // Also search instructors whose user firstName or lastName matches
  const matchingUserProfiles = await InstructorProfile.find({
    isApproved: true
  })
    .populate({
      path: 'userId',
      match: {
        $or: [
          { firstName: regex },
          { lastName: regex },
          { email: regex }
        ]
      },
      select: 'firstName lastName avatar email'
    })
    .limit(10);

  const instructorMap = new Map();
  for (const prof of [...instructorProfiles, ...matchingUserProfiles]) {
    if (prof.userId && !instructorMap.has(prof._id.toString())) {
      instructorMap.set(prof._id.toString(), prof);
    }
  }

  const instructors = Array.from(instructorMap.values()).slice(0, 10);

  sendSuccess(res, { courses, classes, articles, instructors }, 'Search results retrieved');
};
