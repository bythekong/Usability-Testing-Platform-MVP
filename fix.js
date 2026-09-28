const fs = require('fs');
let c = fs.readFileSync('apps/web/src/app/tester/ReviewJobView.tsx', 'utf-8');
c = c.replace('ratingMaxLabel: string | null;', 'ratingMaxLabel: string | null;\n  taskUrl?: string | null;');
fs.writeFileSync('apps/web/src/app/tester/ReviewJobView.tsx', c);
