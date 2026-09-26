// Soverix Net Global Script
// Handles dynamic WhatsApp links, mobile drawer menu, and interactive helpers

const SOVERIX_CONFIG = {
  phone: '8801342930870', // Default store WhatsApp number
  displayPhone: '+880 1342-930870',
  channelUrl: 'https://whatsapp.com/channel/0029Va8iGsyIyPtWmND2jm0A',
  email: 'soverixnet@gmail.com',
  getWhatsAppUrl(text) {
    // Check if localStorage has custom phone
    let num = this.phone;
    try {
      const stored = localStorage.getItem('soverix_site_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.whatsappNumber) {
          num = parsed.whatsappNumber.replace(/[^0-9]/g, '');
        }
      }
    } catch (e) {}
    return `https://wa.me/${num}?text=${encodeURIComponent(text || 'Hi, I need VPN pin from Soverix Net')}`;
  }
};

window.SOVERIX_CONFIG = SOVERIX_CONFIG;

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

  // Initialize Auto-Slider / Hero Carousel (every 3 seconds)
  initHeroCarousel();

  // Initialize Welcome Modal Popup
  initWelcomeModal();

  // Initialize Floating WhatsApp Channel Button
  initFloatingWhatsAppChannel();
});

// Welcome Modal Controller
function initWelcomeModal() {
  let modal = document.getElementById('soverix-welcome-modal');

  // If not in DOM, create and append it
  if (!modal) {
    const modalHtml = `
    <div id="soverix-welcome-modal" class="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 opacity-0 pointer-events-none" aria-modal="true" role="dialog">
      <div class="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white shadow-2xl border-2 border-emerald-500/30 overflow-hidden modal-pop p-6 sm:p-8">
        
        <!-- Ambient top glow -->
        <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-36 bg-emerald-500/25 blur-3xl pointer-events-none rounded-full"></div>

        <!-- Close button -->
        <button id="close-welcome-modal" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-lg transition-colors border border-slate-700 focus:outline-none" aria-label="Close welcome modal">
          ✕
        </button>

        <!-- Header badge -->
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

        <!-- Title & Greeting -->
        <h3 class="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
          🎉 স্বাগতম Soverix Net-এ!
        </h3>
        <p class="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
          সৌদি আরব, ওমান, দুবাই (UAE), কুয়েত, কাতার, বাহরাইন ও বাংলাদেশে সেরা <strong class="text-emerald-400">হাই-স্পিড 5G ভিপিএন পিন</strong> ও <strong class="text-emerald-400">হোলসেল রেসেলার প্যানেল</strong> সার্ভিসে আপনাকে স্বাগতম।
        </p>

        <!-- Key Offer Highlights -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-5 mb-6 text-left">
          <div class="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60 flex items-start gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
              ⚡
            </div>
            <div>
              <h4 class="text-xs font-bold text-white">সুপারফাস্ট 5G পিন</h4>
              <p class="text-[11px] text-slate-400 leading-tight mt-0.5">হাই স্পিড আনলিমিটেড ব্রাউজিং ও গেমিং</p>
            </div>
          </div>

          <div class="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60 flex items-start gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
              📞
            </div>
            <div>
              <h4 class="text-xs font-bold text-white">হোয়াটসঅ্যাপ ও ইমো কল</h4>
              <p class="text-[11px] text-slate-400 leading-tight mt-0.5">ক্রিস্টাল ক্লিয়ার অডিও ও ভিডিও কল</p>
            </div>
          </div>

          <div class="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60 flex items-start gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
              💼
            </div>
            <div>
              <h4 class="text-xs font-bold text-white">হোলসেল রেসেলার প্যানেল</h4>
              <p class="text-[11px] text-slate-400 leading-tight mt-0.5">ফোন থেকে ১-ক্লিকে পিন তৈরি করুন</p>
            </div>
          </div>

          <div class="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60 flex items-start gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
              🛡️
            </div>
            <div>
              <h4 class="text-xs font-bold text-white">২৪/৭ লাইভ সাপোর্ট</h4>
              <p class="text-[11px] text-slate-400 leading-tight mt-0.5">১০০% রিপ্লেসমেন্ট ও সাহায্য গ্যারান্টি</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="space-y-2.5">
          <!-- WhatsApp Order CTA -->
          <a href="https://wa.me/8801342930870?text=Hi,%20I%20am%20from%20website%20welcome%20popup%20and%20need%20VPN%20Pin" target="_blank" rel="noopener" class="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01]">
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            <span>হোয়াটসঅ্যাপে পিন অর্ডার করুন (Order PIN)</span>
          </a>

          <!-- WhatsApp Channel CTA -->
          <a href="https://whatsapp.com/channel/0029Va8iGsyIyPtWmND2jm0A" target="_blank" rel="noopener" class="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/40 text-emerald-300 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all">
            <span>📢 অফিশিয়াল হোয়াটসঅ্যাপ চ্যানেলে জয়েন করুন</span>
            <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">10K+ Members</span>
          </a>

          <!-- Dismiss Button -->
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

  // Automatically show on first visit in session after 700ms
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

// Floating WhatsApp Channel Button Controller
function initFloatingWhatsAppChannel() {
  let channelBtn = document.getElementById('floating-wa-channel');

  if (!channelBtn) {
    const channelHtml = `
    <!-- Floating WhatsApp Channel Button (Always Visible) -->
    <a href="https://whatsapp.com/channel/0029Va8iGsyIyPtWmND2jm0A" target="_blank" rel="noopener" id="floating-wa-channel" class="fixed bottom-6 left-4 sm:left-6 z-50 flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-2xl transition-all wa-channel-float-btn hover:scale-105 border border-emerald-400/40 group" aria-label="Join Official WhatsApp Channel">
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
function initHeroCarousel() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dot');
  const progressBar = document.getElementById('slider-progress-line');
  const prevBtn = document.getElementById('slider-prev-btn');
  const nextBtn = document.getElementById('slider-next-btn');
  const container = document.getElementById('hero-slider');

  if (!slides || slides.length === 0) return;

  let currentSlide = 0;
  const totalSlides = slides.length;
  const slideDuration = 3000; // 3 seconds per user request
  let slideInterval = null;

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
        dot.classList.add('bg-emerald-600', 'w-8');
        dot.classList.remove('bg-slate-300', 'w-2.5');
      } else {
        dot.classList.remove('bg-emerald-600', 'w-8');
        dot.classList.add('bg-slate-300', 'w-2.5');
      }
    });

    // Reset progress animation smoothly
    if (progressBar) {
      progressBar.style.animation = 'none';
      void progressBar.offsetHeight; // trigger reflow
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
    slideInterval = setInterval(nextSlide, slideDuration);
  }

  function stopAutoplay() {
    if (slideInterval) {
      clearInterval(slideInterval);
      slideInterval = null;
    }
  }

  // Dot navigation
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      showSlide(i);
      startAutoplay();
    });
  });

  // Next / Prev navigation
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      nextSlide();
      startAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      prevSlide();
      startAutoplay();
    });
  }

  // Touch Swipe for mobile devices
  let touchStartX = 0;
  let touchEndX = 0;

  if (container) {
    container.addEventListener('mouseenter', stopAutoplay);
    container.addEventListener('mouseleave', startAutoplay);

    container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoplay();
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 40) {
        nextSlide();
      } else if (touchEndX - touchStartX > 40) {
        prevSlide();
      }
      startAutoplay();
    }, { passive: true });
  }

  showSlide(0);
  startAutoplay();
}

