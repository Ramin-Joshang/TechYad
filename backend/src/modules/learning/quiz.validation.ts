import { z } from 'zod';

export const createQuizSchema = z.object({
  body: z.object({
    courseId: z.string().optional(),
    lessonId: z.string().optional(),
    title: z.string().min(2),
    description: z.string().optional(),
    duration: z.number().min(1).optional(),
    timeLimit: z.number().min(1).optional(),
    passingScore: z.number().min(0).optional(),
    passMark: z.number().min(0).optional(),
    questions: z.array(z.object({
      type: z.enum(['single_choice', 'multiple_choice', 'true_false']),
      text: z.string(),
      score: z.number().default(1),
      order: z.number().optional().default(1),
      options: z.array(z.object({
        text: z.string(),
        isCorrect: z.boolean()
      }))
    })).optional().default([])
  })
});

export const submitQuizSchema = z.object({
  body: z.object({
    answers: z.array(z.object({
      questionId: z.string(),
      selectedOptionIds: z.array(z.string())
    }))
  })
});
