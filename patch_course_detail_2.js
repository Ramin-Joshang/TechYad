const fs = require('fs');

let code = fs.readFileSync('frontend/src/components/courses/CourseDetailsContainer.tsx', 'utf8');

// Replace button rendering
code = code.replace(
  /{addToCartMutation\.isPending \? \(\s*<Loader2 className="w-6 h-6 animate-spin" \/>\s*\) : isFree \? \(\s*'شروع یادگیری \(رایگان\)'\s*\) : isInCart \? \(\s*<>\s*<CheckCircle className="w-6 h-6" \/> مشاهده در سبد خرید\s*<\/>\s*\) : \(\s*<>\s*<ShoppingCart className="w-6 h-6" \/> ثبت‌نام در دوره\s*<\/>\s*\)}/m,
  `{addToCartMutation.isPending ? (
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
                )}`
);

// We need to also replace the handleAddToCart function
// Let's find it.
const funcMatch = code.match(/const handleAddToCart = \(\) => \{[\s\S]*?\};/);
if (funcMatch) {
    let newFunc = funcMatch[0].replace(
        "if (!isInCart) {",
        "if (isEnrolled) {\n      router.push(`/student/courses`); // No /learn route yet maybe?\n    } else if (!isInCart) {"
    );
    code = code.replace(funcMatch[0], newFunc);
}

fs.writeFileSync('frontend/src/components/courses/CourseDetailsContainer.tsx', code);
