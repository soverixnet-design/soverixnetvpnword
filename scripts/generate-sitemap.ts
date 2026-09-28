import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SitemapEntry {
  path: string;
  priority: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  lastmod?: string;
  title: string;
  image?: {
    loc: string;
    title: string;
    caption: string;
  };
  alternates?: {
    hreflang: string;
    href: string;
  }[];
}

const PRIMARY_DOMAIN = 'https://soverixnet-design.github.io';
const CUSTOM_DOMAIN = 'https://soverixnet.com';

const PAGES: SitemapEntry[] = [
  {
    path: '/',
    priority: '1.0',
    changefreq: 'daily',
    title: 'Soverixnet - The Ultimate Quantum-Safe Encrypted VPN, Low-Ping Gaming & Privacy Shield',
    image: {
      loc: `${PRIMARY_DOMAIN}/hero_vpn_shield_3d.jpg`,
      title: 'Soverixnet 3D Quantum Shield Official Banner',
      caption: 'The Ultimate Quantum-Safe Encrypted VPN for Saudi, Malaysia, Qatar, UAE & Bangladesh',
    },
    alternates: [
      { hreflang: 'x-default', href: `${PRIMARY_DOMAIN}/` },
      { hreflang: 'en', href: `${PRIMARY_DOMAIN}/?lang=en` },
      { hreflang: 'bn', href: `${PRIMARY_DOMAIN}/?lang=bn` },
      { hreflang: 'ar', href: `${PRIMARY_DOMAIN}/#product-saudi` },
      { hreflang: 'ms-MY', href: `${PRIMARY_DOMAIN}/malaysia.html` },
    ]
  },
  {
    path: '/saudi.html',
    priority: '0.95',
    changefreq: 'daily',
    title: 'Saudi Arabia 5G & Free Net VPN Packages | STC, Mobily, Zain - Soverix Net',
    image: {
      loc: `${PRIMARY_DOMAIN}/saudi_5g_banner.jpg`,
      title: 'Saudi Arabia 5G VPN Package Banner',
      caption: 'Unlimited Free Net SIM Bypass for STC, Mobily and Zain in Saudi Arabia',
    },
    alternates: [
      { hreflang: 'x-default', href: `${PRIMARY_DOMAIN}/saudi.html` },
      { hreflang: 'ar-SA', href: `${PRIMARY_DOMAIN}/saudi.html` },
      { hreflang: 'bn', href: `${PRIMARY_DOMAIN}/saudi.html?lang=bn` },
      { hreflang: 'en', href: `${PRIMARY_DOMAIN}/saudi.html?lang=en` },
    ]
  },
  {
    path: '/malaysia.html',
    priority: '0.95',
    changefreq: 'daily',
    title: 'Malaysia VPN Pins & High-Speed 5G Packages | CelcomDigi, Hotlink, U Mobile - Soverix Net',
    image: {
      loc: `${PRIMARY_DOMAIN}/hero_vpn_shield_3d.jpg`,
      title: 'Malaysia CelcomDigi & Hotlink 5G VPN Hub',
      caption: '12ms Low Ping Mobile Legends Gaming & Touch n Go DuitNow in Malaysia',
    },
    alternates: [
      { hreflang: 'x-default', href: `${PRIMARY_DOMAIN}/malaysia.html` },
      { hreflang: 'ms-MY', href: `${PRIMARY_DOMAIN}/malaysia.html` },
      { hreflang: 'bn', href: `${PRIMARY_DOMAIN}/malaysia.html?lang=bn` },
      { hreflang: 'en', href: `${PRIMARY_DOMAIN}/malaysia.html?lang=en` },
    ]
  },
  {
    path: '/qatar-bahrain.html',
    priority: '0.95',
    changefreq: 'daily',
    title: 'Qatar & Bahrain VPN Pins & Packages | Ooredoo, Batelco, STC - Soverix Net',
    image: {
      loc: `${PRIMARY_DOMAIN}/qatar_bahrain_banner.jpg`,
      title: 'Qatar and Bahrain VoIP & 5G VPN Banner',
      caption: 'Unblocked WhatsApp & IMO Calling for Ooredoo Qatar, Vodafone, and Batelco Bahrain',
    },
    alternates: [
      { hreflang: 'x-default', href: `${PRIMARY_DOMAIN}/qatar-bahrain.html` },
      { hreflang: 'ar-QA', href: `${PRIMARY_DOMAIN}/qatar.html` },
      { hreflang: 'ar-BH', href: `${PRIMARY_DOMAIN}/bahrain.html` },
      { hreflang: 'bn', href: `${PRIMARY_DOMAIN}/qatar-bahrain.html?lang=bn` },
      { hreflang: 'en', href: `${PRIMARY_DOMAIN}/qatar-bahrain.html?lang=en` },
    ]
  },
  {
    path: '/qatar.html',
    priority: '0.90',
    changefreq: 'daily',
    title: 'Qatar VPN Pins & High-Speed 5G Packages | Ooredoo Qatar & Vodafone - Soverix Net',
    image: {
      loc: `${PRIMARY_DOMAIN}/qatar_bahrain_banner.jpg`,
      title: 'Qatar Ooredoo 5G Calling Hub',
      caption: 'Dedicated Qatar WhatsApp Video Calling & Low Ping Tunnel',
    },
    alternates: [
      { hreflang: 'x-default', href: `${PRIMARY_DOMAIN}/qatar.html` },
      { hreflang: 'ar-QA', href: `${PRIMARY_DOMAIN}/qatar.html` },
      { hreflang: 'bn', href: `${PRIMARY_DOMAIN}/qatar.html?lang=bn` },
      { hreflang: 'en', href: `${PRIMARY_DOMAIN}/qatar.html?lang=en` },
    ]
  },
  {
    path: '/bahrain.html',
    priority: '0.90',
    changefreq: 'daily',
    title: 'Bahrain VPN Pins & VoIP Calling Packages | Batelco, STC, Zain - Soverix Net',
    image: {
      loc: `${PRIMARY_DOMAIN}/qatar_bahrain_banner.jpg`,
      title: 'Bahrain Batelco & STC VPN Hub',
      caption: 'Crystal Clear VoIP Calling in Bahrain',
    },
    alternates: [
      { hreflang: 'x-default', href: `${PRIMARY_DOMAIN}/bahrain.html` },
      { hreflang: 'ar-BH', href: `${PRIMARY_DOMAIN}/bahrain.html` },
      { hreflang: 'bn', href: `${PRIMARY_DOMAIN}/bahrain.html?lang=bn` },
      { hreflang: 'en', href: `${PRIMARY_DOMAIN}/bahrain.html?lang=en` },
    ]
  },
  {
    path: '/uae.html',
    priority: '0.95',
    changefreq: 'daily',
    title: 'UAE (Dubai & Abu Dhabi) VPN Pins & Packages | du, Etisalat, Virgin - Soverix Net',
    image: {
      loc: `${PRIMARY_DOMAIN}/uae_banner.jpg`,
      title: 'UAE Dubai 5G Calling & VPN Banner',
      caption: 'High-speed WhatsApp and FaceTime calling in Dubai & Abu Dhabi for du & Etisalat',
    },
    alternates: [
      { hreflang: 'x-default', href: `${PRIMARY_DOMAIN}/uae.html` },
      { hreflang: 'ar-AE', href: `${PRIMARY_DOMAIN}/uae.html` },
      { hreflang: 'bn', href: `${PRIMARY_DOMAIN}/uae.html?lang=bn` },
      { hreflang: 'en', href: `${PRIMARY_DOMAIN}/uae.html?lang=en` },
    ]
  },
  {
    path: '/oman.html',
    priority: '0.90',
    changefreq: 'daily',
    title: 'Oman VPN Pins & Packages | Omantel, Ooredoo, Vodafone, Friendi - Soverix Net',
    image: {
      loc: `${PRIMARY_DOMAIN}/oman_banner.jpg`,
      title: 'Oman Omantel & Ooredoo VPN Banner',
      caption: 'High speed calling and unlimited browsing in Oman',
    },
    alternates: [
      { hreflang: 'x-default', href: `${PRIMARY_DOMAIN}/oman.html` },
      { hreflang: 'ar-OM', href: `${PRIMARY_DOMAIN}/oman.html` },
      { hreflang: 'bn', href: `${PRIMARY_DOMAIN}/oman.html?lang=bn` },
      { hreflang: 'en', href: `${PRIMARY_DOMAIN}/oman.html?lang=en` },
    ]
  },
  {
    path: '/kuwait.html',
    priority: '0.90',
    changefreq: 'daily',
    title: 'Kuwait VPN Pins & Packages | Zain, Ooredoo, STC Kuwait - Soverix Net',
    image: {
      loc: `${PRIMARY_DOMAIN}/bd_kuwait_banner.jpg`,
      title: 'Kuwait 5G VIP VPN Banner',
      caption: 'Uncapped fast tunnel for Zain, Ooredoo and STC Kuwait',
    },
    alternates: [
      { hreflang: 'x-default', href: `${PRIMARY_DOMAIN}/kuwait.html` },
      { hreflang: 'ar-KW', href: `${PRIMARY_DOMAIN}/kuwait.html` },
      { hreflang: 'bn', href: `${PRIMARY_DOMAIN}/kuwait.html?lang=bn` },
      { hreflang: 'en', href: `${PRIMARY_DOMAIN}/kuwait.html?lang=en` },
    ]
  },
  {
    path: '/bangladesh.html',
    priority: '0.90',
    changefreq: 'daily',
    title: 'Bangladesh VIP VPN & Gaming Packages | GP, Robi, Banglalink, Teletalk - Soverix Net',
    image: {
      loc: `${PRIMARY_DOMAIN}/bd_kuwait_banner.jpg`,
      title: 'Bangladesh All-SIM VIP VPN Banner',
      caption: 'Low Ping Gaming & Safe Banking for GP, Robi, Banglalink in Bangladesh',
    },
    alternates: [
      { hreflang: 'x-default', href: `${PRIMARY_DOMAIN}/bangladesh.html` },
      { hreflang: 'bn-BD', href: `${PRIMARY_DOMAIN}/bangladesh.html` },
      { hreflang: 'en', href: `${PRIMARY_DOMAIN}/bangladesh.html?lang=en` },
    ]
  },
  {
    path: '/reseller.html',
    priority: '0.85',
    changefreq: 'weekly',
    title: 'VPN Reseller Wholesale Portal | 100+ Credit Package & Sub-Agent Panel - Soverix Net',
    image: {
      loc: `${PRIMARY_DOMAIN}/reseller_banner.jpg`,
      title: 'Reseller Wholesale Portal Banner',
      caption: 'Wholesale VPN PIN packages with 60% profit margin and custom brand naming',
    },
    alternates: [
      { hreflang: 'x-default', href: `${PRIMARY_DOMAIN}/reseller.html` },
      { hreflang: 'bn', href: `${PRIMARY_DOMAIN}/reseller.html?lang=bn` },
      { hreflang: 'en', href: `${PRIMARY_DOMAIN}/reseller.html?lang=en` },
    ]
  },
  {
    path: '/tutorial.html',
    priority: '0.80',
    changefreq: 'weekly',
    title: 'VPN Connection Tutorials & Setup Guides | Android, iOS, Windows - Soverix Net',
    image: {
      loc: `${PRIMARY_DOMAIN}/soverix_android_tips.jpg`,
      title: 'Android & Mobile VPN Setup Guide',
      caption: 'Step-by-step video and pictorial guide for connecting Soverix Net VPN',
    },
    alternates: [
      { hreflang: 'x-default', href: `${PRIMARY_DOMAIN}/tutorial.html` },
      { hreflang: 'bn', href: `${PRIMARY_DOMAIN}/tutorial.html?lang=bn` },
      { hreflang: 'en', href: `${PRIMARY_DOMAIN}/tutorial.html?lang=en` },
    ]
  },
];

export function generateSitemapXml(domain: string = PRIMARY_DOMAIN): string {
  const currentDate = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  for (const page of PAGES) {
    const loc = page.path === '/' ? `${domain}/` : `${domain}${page.path}`;
    const lastmod = page.lastmod || currentDate;

    xml += `  <url>\n`;
    xml += `    <loc>${loc}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;

    // Alternate language links
    if (page.alternates && page.alternates.length > 0) {
      for (const alt of page.alternates) {
        xml += `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}" />\n`;
      }
    }

    // Google Image Search metadata
    if (page.image) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${page.image.loc}</image:loc>\n`;
      xml += `      <image:title><![CDATA[${page.image.title}]]></image:title>\n`;
      xml += `      <image:caption><![CDATA[${page.image.caption}]]></image:caption>\n`;
      xml += `    </image:image>\n`;
    }

    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}

export function generateRobotsTxt(domain: string = PRIMARY_DOMAIN): string {
  return `# Robots.txt for Soverix Net VPN
User-agent: *
Allow: /
Allow: /saudi.html
Allow: /malaysia.html
Allow: /qatar-bahrain.html
Allow: /qatar.html
Allow: /bahrain.html
Allow: /uae.html
Allow: /oman.html
Allow: /kuwait.html
Allow: /bangladesh.html
Allow: /reseller.html
Allow: /tutorial.html
Disallow: /admin.html
Disallow: /api/

# Official Sitemaps
Sitemap: ${PRIMARY_DOMAIN}/sitemap.xml
Sitemap: ${CUSTOM_DOMAIN}/sitemap.xml
`;
}

export function writeSitemapFiles(): void {
  const rootDir = path.resolve(__dirname, '..');
  const publicDir = path.resolve(rootDir, 'public');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapXml = generateSitemapXml(PRIMARY_DOMAIN);
  const robotsTxt = generateRobotsTxt(PRIMARY_DOMAIN);

  // Write to public directory (served by Vite and packaged into dist)
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf-8');

  // Also write to workspace root for static tooling or direct root access
  fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  fs.writeFileSync(path.join(rootDir, 'robots.txt'), robotsTxt, 'utf-8');

  console.log('✓ Successfully generated sitemap.xml and robots.txt in /public and root directory!');
  console.log(`✓ Indexed ${PAGES.length} regional pages and sub-pages.`);
}

// Execute generator
writeSitemapFiles();

