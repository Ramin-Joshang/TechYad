const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(dashboard)/components/NotificationDropdown.tsx', 'utf8');

code = code.replace(/!n\.isRead/g, "!n.readAt");
code = code.replace(/notif\.isRead \?/g, "notif.readAt ?");
code = code.replace(/!notif\.isRead/g, "!notif.readAt");

fs.writeFileSync('frontend/src/app/(dashboard)/components/NotificationDropdown.tsx', code);
