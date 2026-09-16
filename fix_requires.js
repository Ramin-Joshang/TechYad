const fs = require('fs');

function replaceRequires(filePath) {
    let code = fs.readFileSync(filePath, 'utf8');
    
    const requires = [];
    code = code.replace(/const\s+(?:\{\s*)?([a-zA-Z0-9_]+)(?:\s*\})?\s*=\s*require\(['"]([^'"]+)['"]\)(?:\.[a-zA-Z0-9_]+)?;/g, (match, variable, importPath) => {
        let cleanPath = importPath;
        if (!cleanPath.endsWith('.js')) {
            cleanPath += '.js';
        }
        requires.push(`import { ${variable} } from '${cleanPath}';`);
        return '';
    });
    
    // Add unique requires to the top after the last import
    if (requires.length > 0) {
        const uniqueRequires = [...new Set(requires)];
        const importRegex = /^import\s+.*?;/gm;
        let lastMatch;
        let match;
        while ((match = importRegex.exec(code)) !== null) {
            lastMatch = match;
        }
        
        let insertPos = 0;
        if (lastMatch) {
            insertPos = lastMatch.index + lastMatch[0].length;
        }
        
        code = code.slice(0, insertPos) + '\n' + uniqueRequires.join('\n') + code.slice(insertPos);
        fs.writeFileSync(filePath, code);
        console.log('Fixed', filePath);
    }
}

replaceRequires('backend/src/modules/admin/admin.service.ts');
replaceRequires('backend/src/modules/courses/course.service.ts');
replaceRequires('backend/src/modules/learning/assignment.service.ts');
replaceRequires('backend/src/modules/learning/quiz.service.ts');
replaceRequires('backend/src/modules/commerce/commerce.service.ts');
