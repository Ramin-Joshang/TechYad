import { z } from 'zod';

export const createAssignmentSchema = z.object({
  body: z.object({
    courseId: z.string().optional(),
    lessonId: z.string().optional(),
    title: z.string().min(2),
    description: z.string().optional(),
    type: z.enum(['file_upload', 'text_answer', 'mixed']).optional().default('mixed'),
    maxScore: z.number().min(0).optional(),
    points: z.number().min(0).optional(),
    deadline: z.string().optional().nullable(),
    attachments: z.array(z.string()).optional(),
  })
});

export const submitAssignmentSchema = z.object({
  body: z.object({
    answerText: z.string().optional(),
    files: z.array(z.string()).optional()
  })
});

export const gradeSubmissionSchema = z.object({
  body: z.object({
    score: z.number().min(0),
    feedback: z.string().optional()
  })
});
