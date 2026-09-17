const fs = require('fs');

let code = fs.readFileSync('frontend/src/components/courses/CourseDetailsContainer.tsx', 'utf8');

const enrollmentQuery = `
  // Check if enrolled
  const { data: enrollment, isLoading: enrollmentLoading } = useQuery({
    queryKey: ['enrollment', course?._id],
    queryFn: () => api.get(\`/learning/enrollments/\${course._id}\`).then(res => res.data).catch(() => null),
    enabled: isAuthenticated && !isInitializing && !!course?._id
  });
  const isEnrolled = !!enrollment;
`;

code = code.replace(
  /\/\/ Add to Cart Mutation/g,
  enrollmentQuery + "\n  // Add to Cart Mutation"
);

fs.writeFileSync('frontend/src/components/courses/CourseDetailsContainer.tsx', code);
