// fix-upload-css.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'src', 'styles', 'Upload.module.css');
let c = fs.readFileSync(filePath, 'utf8');

// Remove local :root block (single-line safe version)
c = c.replace(/:root \{[\s\S]*?--shadow-lg: 0 10px 15px -3px rgba\(0, 0, 0, 0\.1\);\s*\}\s*/g, '');
// Remove prefers-color-scheme dark block
c = c.replace(/@media \(prefers-color-scheme: dark\) \{[\s\S]*?\}\s*\n/g, '');

// Replace CSS vars
c = c.replace(/var\(--primary-dark\)/g, 'var(--color-primary-dark)');
c = c.replace(/var\(--primary\)/g, 'var(--color-primary)');
c = c.replace(/var\(--success\)/g, 'var(--color-success)');
c = c.replace(/var\(--error\)/g, 'var(--color-error)');
c = c.replace(/var\(--warning\)/g, 'var(--color-warning)');
c = c.replace(/var\(--bg-light\)/g, 'var(--color-bg-secondary)');
c = c.replace(/var\(--bg\)/g, 'var(--color-surface)');
c = c.replace(/var\(--text-light\)/g, 'var(--color-text-secondary)');
c = c.replace(/var\(--text\)/g, 'var(--color-text-primary)');
c = c.replace(/var\(--border\)/g, 'var(--color-border)');
c = c.replace(/var\(--shadow-lg\)/g, 'var(--shadow-lg)');
c = c.replace(/var\(--shadow\)\b/g, 'var(--shadow-sm)');

// Replace hardcoded rgba indigo values
c = c.replace(/rgba\(99, 102, 241, 0\.1\)/g, 'var(--color-primary-alpha-1)');
c = c.replace(/rgba\(99, 102, 241, 0\.3\)/g, 'var(--color-primary-alpha-2)');
c = c.replace(/rgba\(99, 102, 241, 0\.4\)/g, 'var(--color-primary-alpha-3)');
c = c.replace(/rgba\(99, 102, 241, 0\.05\)/g, 'var(--color-primary-alpha-1)');
c = c.replace(/rgba\(99, 102, 241, 0\.02\)/g, 'var(--color-primary-alpha-1)');

fs.writeFileSync(filePath, c, 'utf8');
console.log('✅ Upload.module.css fixed. Lines:', c.split('\n').length);
