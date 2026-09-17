const fs = require('fs');

let code = fs.readFileSync('frontend/src/components/courses/CourseDetailsContainer.tsx', 'utf8');

// Add enrollment query
const enrollmentQuery = `
  // Check if enrolled
  const { data: enrollment, isLoading: enrollmentLoading } = useQuery({
    queryKey: ['enrollment', course?._id],
    queryFn: () => api.get(\`/learning/enrollments/\${course._id}\`).then(res => res.data).catch(() => null),
    enabled: isAuthenticated && !isInitializing && !!course?._id
  });
`;

code = code.replace(
  "// Add to Cart Mutation",
  enrollmentQuery + "\n  // Add to Cart Mutation"
);

// Add button logic
code = code.replace(
  /const isFree = course\?\.price === 0;/g,
  "const isFree = course?.price === 0;\n  const isEnrolled = !!enrollment;"
);

// Update button rendering
code = code.replace(
  /} else if \(!isInCart\) {/g,
  "} else if (isEnrolled) {\n      router.push(`/learn/${course.slug}`);\n    } else if (!isInCart) {"
);

const buttonHtml = `
                {addToCartMutation.isPending ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : isEnrolled ? (
                  'شروع یادگیری'
                ) : isFree ? (
                  'شروع یادگیری (رایگان)'
                ) : isInCart ? (
                  <>
                    <CheckCircle className="w-6 h-6" /> مشاهده در سبد خرید
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-6 h-6" /> ثبت‌نام در دوره
                  </>
                )}
`;

code = code.replace(
  /\{addToCartMutation\.isPending \? \([\s\S]*?\)\} \? \(\s*<>[\s\S]*?<\/>\s*\) : \(\s*<>[\s\S]*?<\/>\s*\)\}/m,
  buttonHtml
);

// Actually, let's just do a simpler string replacement for the button content
