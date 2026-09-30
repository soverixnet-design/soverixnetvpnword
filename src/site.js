// Soverix Net Global Master Script
// Handles dynamic banners from Admin Panel, live design/theme sync, WhatsApp ordering, and interactive helpers
import { db } from './firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

const DEFAULT_SETTINGS = {
  whatsappNumber: '8801342930870',
  whatsappDisplayNumber: '+880 1342-930870',
  whatsappChannelUrl: 'https://whatsapp.com/channel/0029Va8iGsyIyPtWmND2jm0A',
  officialEmail: 'soverixnet@gmail.com',
  tickerAnnouncementBn: 'Direct Importer & Wholesale Supplier: Fast 60-Second WhatsApp Delivery on All GCC & Bangladesh PINs',
  promoModalEnabled: true,
  designTheme: {
    siteTitle: 'Soverix Net',
    logoUrl: '/soverix_shield_logo.jpg',
    accentColor: 'emerald',
    primaryHex: '#10b981',
    heroHeadlineBn: 'Next-Gen VPN Pin For All GCC & Bangladesh',
    heroSubheadlineBn: 'Buy 1 pin for personal use or 100 pins for business. Instant WhatsApp delivery in under 60 seconds with 100% replacement warranty.'
  }
};

const SOVERIX_CONFIG = {
  phone: '8801342930870',
  displayPhone: '+880 1342-930870',
  channelUrl: 'https://whatsapp.com/channel/0029Va8iGsyIyPtWmND2jm0A',
  email: 'soverixnet@gmail.com',
  getSettings() {
    try {
      const stored = localStorage.getItem('soverix_site_settings');
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {}
    return DEFAULT_SETTINGS;
  },
  getWhatsAppUrl(text) {
    const settings = this.getSettings();
    let num = settings.whatsappNumber ? settings.whatsappNumber.replace(/[^0-9]/g, '') : this.phone;
    return `https://wa.me/${num}?text=${encodeURIComponent(text || 'Hi, I need VPN pin from Soverix Net')}`;
  }
};

window.SOVERIX_CONFIG = SOVERIX_CONFIG;

function getCacheBustedUrl(url, buster) {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  const ts = buster || Date.now();
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}_cf_ts=${ts}`;
}

// Apply all dynamic branding and texts across the website
function applyDynamicSettings(settings) {
  if (!settings) return;

  // 1. WhatsApp Contact Numbers & Links
  const phone = settings.whatsappDisplayNumber || settings.whatsappNumber || '+880 1342-930870';
  document.querySelectorAll('[data-site-phone]').forEach(el => {
    el.textContent = phone;
  });

  const rawPhone = settings.whatsappNumber ? settings.whatsappNumber.replace(/[^0-9]/g, '') : '8801342930870';
  document.querySelectorAll('[data-site-whatsapp-link]').forEach(el => {
    // Preserve custom text if provided in href query
    try {
      const href = el.getAttribute('href') || '';
      const url = new URL(href, window.location.origin);
      const text = url.searchParams.get('text') || 'Hi, I need VPN pin from Soverix Net';
      el.setAttribute('href', `https://wa.me/${rawPhone}?text=${encodeURIComponent(text)}`);
    } catch (e) {
      el.setAttribute('href', `https://wa.me/${rawPhone}?text=Hi,%20I%20need%20VPN%20pin%20from%20Soverix%20Net`);
    }
  });

  // 2. WhatsApp Channel URL
  if (settings.whatsappChannelUrl) {
    document.querySelectorAll('[data-site-channel-link]').forEach(el => {
      el.setAttribute('href', settings.whatsappChannelUrl);
    });
  }

  // 3. Official Email
  if (settings.officialEmail) {
    document.querySelectorAll('[data-site-email]').forEach(el => {
      el.textContent = settings.officialEmail;
      if (el.tagName === 'A') {
        el.setAttribute('href', `mailto:${settings.officialEmail}`);
      }
    });
  }

  // 4. Top Announcement Ticker Text
  if (settings.tickerAnnouncementBn) {
    document.querySelectorAll('[data-site-ticker]').forEach(el => {
      el.textContent = settings.tickerAnnouncementBn;
    });
  }

  // 5. Site Branding & Title
  if (settings.designTheme?.siteTitle) {
    document.querySelectorAll('[data-site-name]').forEach(el => {
      el.innerHTML = `${settings.designTheme.siteTitle} <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Net</span>`;
    });
    if (!document.title.includes('Admin')) {
      document.title = `${settings.designTheme.siteTitle} - Wholesale & Retail VPN Pin for All GCC & Bangladesh`;
    }
  }

  // 6. Site Logo & Favicon
  if (settings.designTheme?.logoUrl) {
    const freshLogo = getCacheBustedUrl(settings.designTheme.logoUrl, settings.cacheBuster);
    document.querySelectorAll('[data-site-logo]').forEach(el => {
      if (el.tagName === 'IMG') {
        el.setAttribute('src', freshLogo);
      }
    });
  }

  // 7. Hero Headline & Subheadline
  if (settings.designTheme?.heroHeadlineBn) {
    document.querySelectorAll('[data-hero-headline]').forEach(el => {
      el.innerHTML = settings.designTheme.heroHeadlineBn;
    });
  }
  if (settings.designTheme?.heroSubheadlineBn) {
    document.querySelectorAll('[data-hero-subheadline]').forEach(el => {
      el.innerHTML = settings.designTheme.heroSubheadlineBn;
    });
  }

  // 8. Dynamic App Downloads
  if (settings.appAfV2RayUrl) {
    document.querySelectorAll('[data-app-afv2ray]').forEach(el => el.setAttribute('href', settings.appAfV2RayUrl));
  }
  if (settings.appJiyamPlusUrl) {
    document.querySelectorAll('[data-app-jiyamplus]').forEach(el => el.setAttribute('href', settings.appJiyamPlusUrl));
  }
  if (settings.appMohinVipUrl) {
    document.querySelectorAll('[data-app-mohinvip]').forEach(el => el.setAttribute('href', settings.appMohinVipUrl));
  }
  if (settings.appNetSolutionUrl) {
    document.querySelectorAll('[data-app-netsolution]').forEach(el => el.setAttribute('href', settings.appNetSolutionUrl));
  }

  // 9. Dynamic Banners Injection (If custom banners exist in settings)
  if (Array.isArray(settings.banners) && settings.banners.length > 0) {
    renderDynamicHeroBanners(settings.banners);
  }
}

// Render banners dynamically into #hero-slider
function renderDynamicHeroBanners(banners) {
  const container = document.getElementById('hero-slider');
  const dotsContainer = document.querySelector('.slider-dot')?.parentElement;
  if (!container) return;

  const activeBanners = banners.filter(b => b.isActive !== false);
  if (activeBanners.length === 0) return;

  // Build slides HTML
  let slidesHtml = '';
  activeBanners.forEach((b, idx) => {
    const isFirst = idx === 0;
    const title = b.titleBn || b.titleEn || 'Soverix Net VIP VPN Pin';
    const subtitle = b.subtitleBn || b.subtitleEn || '';
    const badge = b.badgeBn || b.badgeEn || '';
    const actionLabel = b.actionLabelBn || b.actionLabelEn || 'অর্ডার করুন';
    const actionUrl = b.actionUrl || SOVERIX_CONFIG.getWhatsAppUrl(title);
    const hasImage = Boolean(b.imageUrl && b.imageUrl.trim());

    slidesHtml += `
      <div class="hero-slide ${isFirst ? 'active' : ''} w-full flex flex-col items-center justify-center text-center px-4 relative transition-all duration-500">
        ${hasImage ? `
          <div class="absolute inset-0 opacity-10 pointer-events-none overflow-hidden rounded-2xl">
            <img src="${getCacheBustedUrl(b.imageUrl, b.cacheBuster)}" alt="" class="w-full h-full object-cover blur-sm" />
          </div>
        ` : ''}
        <div class="relative z-10 flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
          ${badge ? `
            <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-1.5 shadow-sm">
              ${badge}
            </span>
          ` : ''}
          <h2 class="text-sm sm:text-base md:text-lg font-black text-white mb-1 leading-snug line-clamp-2">
            ${title}
          </h2>
          ${subtitle ? `
            <p class="text-[11px] sm:text-xs text-slate-300 line-clamp-1 mb-2 max-w-xl">
              ${subtitle}
            </p>
          ` : ''}
          <div class="pt-0.5">
            <a href="${actionUrl}" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs shadow-md transition-all transform hover:scale-105">
              <span>${actionLabel}</span>
              <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            </a>
          </div>
        </div>
      </div>
    `;
  });

  // Preserve navigation arrows
  const prevBtn = document.getElementById('slider-prev-btn');
  const nextBtn = document.getElementById('slider-next-btn');
  container.innerHTML = slidesHtml;
  if (prevBtn) container.appendChild(prevBtn);
  if (nextBtn) container.appendChild(nextBtn);

  // Update dots
  if (dotsContainer) {
    let dotsHtml = '';
    activeBanners.forEach((_, idx) => {
      dotsHtml += `
        <button class="slider-dot ${idx === 0 ? 'w-5 bg-emerald-400' : 'w-2 bg-slate-700 hover:bg-slate-600'} h-1.5 rounded-full transition-all cursor-pointer" aria-label="Slide ${idx + 1}"></button>
      `;
    });
    dotsContainer.innerHTML = dotsHtml;
  }

  // Re-initialize carousel interval with the new slides
  initHeroCarousel();
}

// Setup mobile menu
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('close-mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
  if (closeBtn && mobileMenu) {
    closeBtn.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  }

  // Update any dynamic links with proper WhatsApp text
  document.querySelectorAll('[data-wa-country]').forEach(el => {
    const country = el.getAttribute('data-wa-country');
    const msg = `Hi, I need VPN pin for ${country}`;
    el.setAttribute('href', SOVERIX_CONFIG.getWhatsAppUrl(msg));
  });

  document.querySelectorAll('[data-wa-reseller]').forEach(el => {
    const msg = 'Hi, I want to become a reseller with Soverix Net';
    el.setAttribute('href', SOVERIX_CONFIG.getWhatsAppUrl(msg));
  });

  // Copy code buttons
  document.querySelectorAll('[data-copy-code]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const code = btn.getAttribute('data-copy-code');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
          const original = btn.innerText;
          btn.innerText = 'Copied!';
          btn.classList.add('bg-emerald-600', 'text-white');
          setTimeout(() => {
            btn.innerText = original;
            btn.classList.remove('bg-emerald-600', 'text-white');
          }, 2000);
        });
      }
    });
  });

  // Apply cached settings immediately
  const initialSettings = SOVERIX_CONFIG.getSettings();
  applyDynamicSettings(initialSettings);

  // Initialize Auto-Slider / Hero Carousel (every 3 seconds)
  initHeroCarousel();

  // Initialize Welcome Modal Popup
  initWelcomeModal(initialSettings.promoModalEnabled !== false);

  // Initialize Floating WhatsApp Channel Button
  initFloatingWhatsAppChannel();

  // Initialize Floating Admin Quick Button (Direct 1-click access to Admin Panel)
  initFloatingAdminButton();

  // Initialize Stripe-style 3D Tilt & Parallax
  init3DInteractiveTilt();
  initScrollParallax();

  // Listen to local settings change event
  window.addEventListener('soverix_settings_changed', (e) => {
    if (e.detail) {
      applyDynamicSettings(e.detail);
    }
  });

  // Cross-Tab Instant Sync via BroadcastChannel
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const bc = new BroadcastChannel('soverix_sync_bus');
      bc.onmessage = (event) => {
        if (event.data?.payload) {
          applyDynamicSettings(event.data.payload);
        }
      };
    } catch {}
  }

  // Real-time synchronization from Firestore
  try {
    onSnapshot(doc(db, 'settings', 'general'), (snap) => {
      if (snap.exists()) {
        const firestoreData = snap.data();
        try {
          localStorage.setItem('soverix_site_settings', JSON.stringify(firestoreData));
        } catch (e) {}
        applyDynamicSettings(firestoreData);
      }
    }, (err) => {
      if (err && err.code !== 'unavailable') {
        console.warn('Firestore real-time settings notice:', err?.message || err);
      }
    });
  } catch (err) {
    console.warn('Firestore listener initialize warning:', err);
  }
});

// Floating Admin Quick Action Button (Direct link to /admin.html)
function initFloatingAdminButton() {
  if (document.getElementById('floating-admin-quick-btn')) return;

  const btnHtml = `
    <!-- Floating Admin Quick Link -->
    <a href="admin.html" id="floating-admin-quick-btn" class="fixed bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-amber-300 font-bold text-xs border border-amber-500/40 shadow-xl backdrop-blur-md transition-all hover:scale-105 group" title="এডমিন প্যানেলে যান (Admin Control Panel)">
      <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
      <span class="flex items-center gap-1.5">
        <svg class="w-4 h-4 fill-current text-amber-400 group-hover:rotate-45 transition-transform" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
        <span class="hidden sm:inline">এডমিন প্যানেল</span>
      </span>
    </a>
  `;
  document.body.insertAdjacentHTML('beforeend', btnHtml);
}

// 3D Interactive Card Tilt (Stripe-Grade Pro Designer Effect)
function init3DInteractiveTilt() {
  const tiltElements = document.querySelectorAll('[data-3d-tilt]');
  if (!tiltElements || tiltElements.length === 0) return;

  tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

      const glare = el.querySelector('.specular-glare');
      if (glare) {
        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;
        glare.style.background = `radial-gradient(circle 200px at ${percentX}% ${percentY}%, rgba(255,255,255,0.12), transparent)`;
        glare.style.opacity = '1';
      }
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      const glare = el.querySelector('.specular-glare');
      if (glare) {
        glare.style.opacity = '0';
      }
    });

    el.addEventListener('mouseenter', () => {
      el.style.transition = 'none';
    });
  });

  // Hero Section 3D Stage Dynamic Tracking
  const heroStage = document.getElementById('hero-3d-stage');
  const heroContainer = document.getElementById('hero-stage-container');
  if (heroStage && heroContainer) {
    heroContainer.addEventListener('mousemove', (e) => {
      const rect = heroContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -8;
      const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 8;
      heroStage.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    });

    heroContainer.addEventListener('mouseleave', () => {
      heroStage.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
      heroStage.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    heroContainer.addEventListener('mouseenter', () => {
      heroStage.style.transition = 'none';
    });
  }
}

// Subtle Parallax on Scroll (Compositor-friendly transform)
function initScrollParallax() {
  const parallaxOrbs = document.querySelectorAll('[data-parallax-speed]');
  if (!parallaxOrbs || parallaxOrbs.length === 0) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        parallaxOrbs.forEach(orb => {
          const speed = parseFloat(orb.getAttribute('data-parallax-speed') || '0.15');
          const yPos = scrolled * speed;
          orb.style.transform = `translate3d(0, ${yPos.toFixed(1)}px, 0)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// Welcome Modal Controller
function initWelcomeModal(enabled = true) {
  let modal = document.getElementById('soverix-welcome-modal');

  if (!modal) {
    const modalHtml = `
    <div id="soverix-welcome-modal" class="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 opacity-0 pointer-events-none" aria-modal="true" role="dialog">
      <div class="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white shadow-2xl border-2 border-emerald-500/30 overflow-hidden modal-pop p-6 sm:p-8">
        
        <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-36 bg-emerald-500/25 blur-3xl pointer-events-none rounded-full"></div>

        <button id="close-welcome-modal" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-lg transition-colors border border-slate-700 focus:outline-none" aria-label="Close welcome modal">
          ✕
        </button>

        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 p-1 flex items-center justify-center shrink-0">
            <img src="/soverix_shield_logo.jpg" alt="Soverix Net Logo" class="w-full h-full object-cover rounded-xl" />
          </div>
          <div>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Soverix Net • অফিসিয়াল ভিপিএন প্ল্যাটফর্ম</span>
            </span>
            <div class="text-xs text-slate-400 mt-0.5">GCC & Bangladesh Master Provider</div>
          </div>
        </div>

        <h3 class="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
          🎉 স্বাগতম Soverix Net-এ!
        </h3>
        <p class="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
          সৌদি আরব, ওমান, দুবাই (UAE), কুয়েত, কাতার, বাহরাইন ও বাংলাদেশে সেরা <strong class="text-emerald-400">হাই-স্পিড 5G ভিপিএন পিন</strong> ও <strong class="text-emerald-400">হোলসেল রেসেলার প্যানেল</strong> সার্ভিসে আপনাকে স্বাগতম।
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-5 mb-6 text-left">
          <div class="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60 flex items-start gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">⚡</div>
            <div>
              <h4 class="text-xs font-bold text-white">সুপারফাস্ট 5G পিন</h4>
              <p class="text-[11px] text-slate-400 leading-tight mt-0.5">হাই স্পিড আনলিমিটেড ব্রাউজিং ও গেমিং</p>
            </div>
          </div>

          <div class="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60 flex items-start gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">📞</div>
            <div>
              <h4 class="text-xs font-bold text-white">হোয়াটসঅ্যাপ ও ইমো কল</h4>
              <p class="text-[11px] text-slate-400 leading-tight mt-0.5">ক্রিস্টাল ক্লিয়ার অডিও ও ভিডিও কল</p>
            </div>
          </div>

          <div class="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60 flex items-start gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">💼</div>
            <div>
              <h4 class="text-xs font-bold text-white">হোলসেল রেসেলার প্যানেল</h4>
              <p class="text-[11px] text-slate-400 leading-tight mt-0.5">ফোন থেকে ১-ক্লিকে পিন তৈরি করুন</p>
            </div>
          </div>

          <div class="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60 flex items-start gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">🛡️</div>
            <div>
              <h4 class="text-xs font-bold text-white">২৪/৭ লাইভ সাপোর্ট</h4>
              <p class="text-[11px] text-slate-400 leading-tight mt-0.5">১০০% রিপ্লেসমেন্ট ও সাহায্য গ্যারান্টি</p>
            </div>
          </div>
        </div>

        <div class="space-y-2.5">
          <a href="${SOVERIX_CONFIG.getWhatsAppUrl('Hi, I need VPN PIN from Soverix Net')}" target="_blank" rel="noopener" data-site-whatsapp-link class="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01]">
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            <span>হোয়াটসঅ্যাপে পিন অর্ডার করুন (Order PIN)</span>
          </a>

          <a href="https://whatsapp.com/channel/0029Va8iGsyIyPtWmND2jm0A" target="_blank" rel="noopener" data-site-channel-link class="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/40 text-emerald-300 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all">
            <span>📢 অফিশিয়াল হোয়াটসঅ্যাপ চ্যানেলে জয়েন করুন</span>
            <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">10K+ Members</span>
          </a>

          <button id="dismiss-welcome-modal" class="w-full py-2.5 text-center text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors">
            ওয়েবসাইটে প্রবেশ করুন (Explore Website) →
          </button>
        </div>

      </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    modal = document.getElementById('soverix-welcome-modal');
  }

  function showModal() {
    if (!modal) return;
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100');
    document.body.style.overflow = 'hidden';
  }

  function hideModal() {
    if (!modal) return;
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0', 'pointer-events-none');
    document.body.style.overflow = '';
    try {
      sessionStorage.setItem('soverix_welcome_seen_v2', 'true');
    } catch (e) {}
  }

  window.openWelcomeModal = showModal;
  window.closeWelcomeModal = hideModal;

  const closeBtn = document.getElementById('close-welcome-modal');
  const dismissBtn = document.getElementById('dismiss-welcome-modal');

  if (closeBtn) closeBtn.addEventListener('click', hideModal);
  if (dismissBtn) dismissBtn.addEventListener('click', hideModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideModal();
  });

  if (enabled) {
    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem('soverix_welcome_seen_v2') === 'true';
    } catch (e) {}

    if (!alreadySeen) {
      setTimeout(() => {
        showModal();
      }, 700);
    }
  }
}

// Floating WhatsApp Channel Button Controller
function initFloatingWhatsAppChannel() {
  let channelBtn = document.getElementById('floating-wa-channel');

  if (!channelBtn) {
    const channelHtml = `
    <!-- Floating WhatsApp Channel Button (Always Visible) -->
    <a href="https://whatsapp.com/channel/0029Va8iGsyIyPtWmND2jm0A" data-site-channel-link target="_blank" rel="noopener" id="floating-wa-channel" class="fixed bottom-6 left-4 sm:left-6 z-40 flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-2xl transition-all wa-channel-float-btn hover:scale-105 border border-emerald-400/40 group" aria-label="Join Official WhatsApp Channel">
      <div class="relative flex items-center justify-center shrink-0">
        <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.35 5L2 22l5.17-1.33C8.61 21.49 10.26 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <span class="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
        </span>
      </div>
      <div class="flex flex-col text-left">
        <span class="text-[9px] sm:text-[10px] font-semibold text-emerald-100 uppercase tracking-wider leading-none">Official</span>
        <span class="text-xs sm:text-sm font-black leading-tight text-white flex items-center gap-1">
          <span>WhatsApp চ্যানেল</span>
          <span class="hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/20 text-white">Join</span>
        </span>
      </div>
    </a>
    `;
    document.body.insertAdjacentHTML('beforeend', channelHtml);
  }
}

// Hero Carousel / Auto Slider Controller (Auto changes every 3 seconds)
let globalSlideInterval = null;

function initHeroCarousel() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dot');
  const progressBar = document.getElementById('slider-progress-line');
  const prevBtn = document.getElementById('slider-prev-btn');
  const nextBtn = document.getElementById('slider-next-btn');
  const container = document.getElementById('hero-slider');

  if (!slides || slides.length === 0) return;

  if (globalSlideInterval) {
    clearInterval(globalSlideInterval);
    globalSlideInterval = null;
  }

  let currentSlide = 0;
  const totalSlides = slides.length;
  const slideDuration = 3000;

  function showSlide(index) {
    if (index >= totalSlides) currentSlide = 0;
    else if (index < 0) currentSlide = totalSlides - 1;
    else currentSlide = index;

    slides.forEach((slide, i) => {
      if (i === currentSlide) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    dots.forEach((dot, i) => {
      if (i === currentSlide) {
        dot.classList.add('bg-emerald-400', 'w-5');
        dot.classList.remove('bg-slate-700', 'w-2');
      } else {
        dot.classList.remove('bg-emerald-400', 'w-5');
        dot.classList.add('bg-slate-700', 'w-2');
      }
    });

    if (progressBar) {
      progressBar.style.animation = 'none';
      void progressBar.offsetHeight;
      progressBar.style.animation = `slide-progress-3s ${slideDuration}ms linear infinite`;
    }
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function prevSlide() {
    showSlide(currentSlide - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    globalSlideInterval = setInterval(nextSlide, slideDuration);
  }

  function stopAutoplay() {
    if (globalSlideInterval) {
      clearInterval(globalSlideInterval);
      globalSlideInterval = null;
    }
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      showSlide(i);
      startAutoplay();
    });
  });

  if (nextBtn) {
    nextBtn.onclick = (e) => {
      e.preventDefault();
      nextSlide();
      startAutoplay();
    };
  }

  if (prevBtn) {
    prevBtn.onclick = (e) => {
      e.preventDefault();
      prevSlide();
      startAutoplay();
    };
  }

  if (container) {
    container.onmouseenter = stopAutoplay;
    container.onmouseleave = startAutoplay;

    let touchStartX = 0;
    container.ontouchstart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoplay();
    };

    container.ontouchend = (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 40) {
        nextSlide();
      } else if (touchEndX - touchStartX > 40) {
        prevSlide();
      }
      startAutoplay();
    };
  }

  showSlide(0);
  startAutoplay();
}
