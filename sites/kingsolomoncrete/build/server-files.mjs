// Web server configuration: Apache .htaccess (shared hosting) + nginx example.
import crypto from 'node:crypto';
import { writeFile } from './lib/util.mjs';

const ANALYTICS = 'https://www.googletagmanager.com https://connect.facebook.net';
const CONNECT = "https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://*.g.doubleclick.net https://www.google.com https://www.facebook.com";
const IMG = "https://*.google-analytics.com https://www.googletagmanager.com https://*.g.doubleclick.net https://www.google.com https://www.facebook.com";

export function writeServerFiles(inlineScripts) {
  const hashes = [...new Set(inlineScripts)].map((s) => `'sha256-${crypto.createHash('sha256').update(s).digest('base64')}'`).join(' ');
  const csp = [
    "default-src 'self'",
    `script-src 'self' ${hashes} ${ANALYTICS}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: ${IMG}`,
    "font-src 'self'",
    `connect-src 'self' ${CONNECT}`,
    "media-src 'self'",
    'frame-src https://www.googletagmanager.com',
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    'upgrade-insecure-requests',
  ].join('; ');

  writeFile('.htaccess', `# King Solomon · Apache configuration
Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html
AddDefaultCharset UTF-8

<IfModule mod_rewrite.c>
RewriteEngine On
# Force HTTPS and the www host
RewriteCond %{HTTPS} off [OR]
RewriteCond %{HTTP_HOST} !^www\\. [NC]
RewriteCond %{HTTP_HOST} !^(localhost|127\\.0\\.0\\.1) [NC]
RewriteRule ^ https://www.kingsolomoncrete.com%{REQUEST_URI} [L,R=301]
# Block access to hidden files and private storage
RewriteRule (^|/)\\.(?!well-known) - [F]
# Block common attack probes
RewriteCond %{QUERY_STRING} (\\<|%3C).*script.*(\\>|%3E) [NC,OR]
RewriteCond %{QUERY_STRING} (\\.\\./|%2e%2e%2f) [NC]
RewriteRule ^ - [F]
RewriteRule ^api/storage/ - [F]
RewriteRule ^api/config\\.local\\.php$ - [F]
RewriteRule ^api/lead-i18n\\.json$ - [F]
RewriteRule ^api/(?!lead\\.php$) - [F]
RewriteRule \\.(ini|log|sql|bak|backup|zip|tar|gz|sh|md|env)$ - [F,NC]
RewriteRule (^|/)\\.htaccess - [F]
</IfModule>

<IfModule mod_headers.c>
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()"
Header always set Cross-Origin-Opener-Policy "same-origin"
Header always set Content-Security-Policy "${csp}"
<FilesMatch "\\.(html)$">
Header set Cache-Control "public, max-age=600, must-revalidate"
</FilesMatch>
<FilesMatch "\\.(css|js|woff2|avif|webp|jpg|png|svg|mp4|ico)$">
Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>
<FilesMatch "\\.(pdf)$">
Header set Cache-Control "public, max-age=604800"
Header set X-Robots-Tag "noindex"
</FilesMatch>
</IfModule>

<IfModule mod_mime.c>
AddType image/avif .avif
AddType image/webp .webp
AddType font/woff2 .woff2
AddType application/manifest+json .webmanifest
AddType text/plain .txt
</IfModule>

<IfModule mod_deflate.c>
AddOutputFilterByType DEFLATE text/html text/css application/javascript text/javascript application/json image/svg+xml application/xml text/xml text/plain application/manifest+json
</IfModule>
<IfModule mod_brotli.c>
AddOutputFilterByType BROTLI_COMPRESS text/html text/css application/javascript text/javascript application/json image/svg+xml application/xml text/xml text/plain
</IfModule>
`);

  const exp = new Date(Date.now() + 365 * 864e5).toISOString().replace(/\.\d+Z$/, 'Z');
  writeFile('.well-known/security.txt', `Contact: mailto:support@kingsolomoncrete.com\nExpires: ${exp}\nPreferred-Languages: en, he, el\nCanonical: https://www.kingsolomoncrete.com/.well-known/security.txt\nPolicy: https://www.kingsolomoncrete.com/privacy-policy/\n`);
  writeFile('nginx.conf.example', `# King Solomon · nginx server block (example)
server {
  listen 443 ssl http2;
  server_name www.kingsolomoncrete.com;
  root /var/www/kingsolomoncrete/dist;
  index index.html;
  error_page 404 /404.html;
  location / { try_files $uri $uri/ =404; }
  location ~ ^/api/storage/ { deny all; }
  location = /api/lead.php { include fastcgi_params; fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; fastcgi_pass unix:/run/php/php-fpm.sock; }
  location ~* \\.(css|js|woff2|avif|webp|jpg|png|svg|mp4|ico)$ { add_header Cache-Control "public, max-age=31536000, immutable"; }
  gzip on; gzip_types text/css application/javascript image/svg+xml application/json text/plain application/xml;
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
  add_header X-Content-Type-Options nosniff always;
  add_header Referrer-Policy strict-origin-when-cross-origin always;
  add_header Content-Security-Policy "${csp}" always;
}
server { listen 80; listen 443 ssl; server_name kingsolomoncrete.com; return 301 https://www.kingsolomoncrete.com$request_uri; }
`);
}
