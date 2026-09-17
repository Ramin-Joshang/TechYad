const fs = require('fs');

// The class schema still failed because "in-person" was added but the error says 
// mode: `in-person` is not a valid enum value for path `mode`
// wait, the error is about Class model validation
let classModel = fs.readFileSync('backend/src/modules/classes/class.model.ts', 'utf8');
if (!classModel.includes("enum: ['online', 'in-person', 'offline']")) {
    classModel = classModel.replace(
      /mode: {\s*type: String,\s*enum: \['online', 'in-person'\],\s*default: 'online'\s*},/g,
      "mode: { type: String, enum: ['online', 'in-person', 'offline'], default: 'online' },"
    );
    // sometimes it's written differently
    classModel = classModel.replace(
      /enum: \['online', 'offline'\],/g,
      "enum: ['online', 'in-person', 'offline'],"
    );
    fs.writeFileSync('backend/src/modules/classes/class.model.ts', classModel);
}

