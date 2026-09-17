const fs = require('fs');

let classService = fs.readFileSync('backend/src/modules/classes/class.service.ts', 'utf8');

// I duplicated the keys in the object literal by replacing the entire block but keeping it in the middle. Let's fix this.
classService = classService.replace(
  `return await Class.create({
      capacity: data.capacity || data.maxStudents || 50,
      description: data.description || data.shortDescription || 'توضیحاتی برای این کلاس وارد نشده است.',
      endDate: data.endDate || new Date(new Date(data.startDate || new Date()).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      ...data, // NOTE: this will overwrite the above if they are undefined in data but exist in data as undefined!
      // let's re-override to be safe:
      capacity: data.capacity || data.maxStudents || 50,
      description: data.description || data.shortDescription || 'توضیحاتی برای این کلاس وارد نشده است.',
      endDate: data.endDate || new Date(new Date(data.startDate || new Date()).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      mode: data.mode === 'in-person' ? 'in_person' : data.mode, // Fix mode enum in backend
      meetingLink: mockRoomLink,`,
  `const payload = { ...data };
    if (!payload.capacity) payload.capacity = data.maxStudents || 50;
    if (!payload.description) payload.description = data.shortDescription || 'توضیحاتی برای این کلاس وارد نشده است.';
    if (!payload.endDate) payload.endDate = new Date(new Date(data.startDate || new Date()).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    if (payload.mode === 'in-person') payload.mode = 'in_person';

    return await Class.create({
      ...payload,
      meetingLink: mockRoomLink,`
);
fs.writeFileSync('backend/src/modules/classes/class.service.ts', classService);
