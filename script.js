/* ================================================================
   SCRIPT.JS — Untuk Nayla Aulia Zahra
   Semua interaksi, animasi, dan logika front-end
   ================================================================ */

'use strict';

/* ================================================================
   1. AOS INIT
   ================================================================ */
AOS.init({
  duration: 800,
  once: true,
  offset: 60,
  easing: 'ease-out-cubic',
});

/* ================================================================
   2. WELCOME SCREEN + TOAST NOTIFICATION
   ================================================================ */
(function handleWelcomeScreen() {
  const welcome = document.getElementById('welcome-screen');
  const btn = document.getElementById('welcome-btn');
  const toast = document.getElementById('toast');
  const toastClose = document.getElementById('toast-close');
  const toastScroll = document.getElementById('toast-scroll');

  if (!welcome || !btn) return;

  btn.addEventListener('click', () => {
    welcome.classList.add('hidden');
    document.body.classList.add('welcome-done');

    // Scroll ke atas
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Refresh AOS agar animasi hero berjalan
    setTimeout(() => AOS.refresh(), 400);
    // Hapus welcome dari DOM setelah transisi
    setTimeout(() => welcome.remove(), 800);

    // Munculkan toast setelah welcome selesai fade out
    setTimeout(() => {
      if (toast) {
        toast.classList.add('visible');
        // Auto-hide setelah 5 detik
        setTimeout(() => {
          toast.classList.remove('visible');
        }, 5000);
      }
    }, 900);
  });

  // Tombol tutup toast
  if (toastClose) {
    toastClose.addEventListener('click', () => {
      toast.classList.remove('visible');
    });
  }

  // Tombol scroll ke section musik
  if (toastScroll) {
    toastScroll.addEventListener('click', () => {
      toast.classList.remove('visible');
      const musicSection = document.getElementById('lagu-kita');
      if (musicSection) {
        musicSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
})();

/* ================================================================
   3. FLOATING PARTICLES (Hati & Bunga Sakura)
   ================================================================ */
(function createParticles() {
  const container = document.getElementById('particles-container');
  if (!container) return;

  const symbols = ['\u2734', '\u2726', '\u274A', '\u2733', '\u00A7', '🌸', '✿', '❀', '\u2728'];
  const particleCount = window.innerWidth < 600 ? 20 : 35;

  for (let i = 0; i < particleCount; i++) {
    const el = document.createElement('div');
    el.className = 'particle';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];

    const size = 0.8 + Math.random() * 1.2;
    const left = Math.random() * 100;
    const duration = 8 + Math.random() * 14;
    const delay = Math.random() * 20;
    const opacity = 0.2 + Math.random() * 0.4;

    el.style.cssText = `
      left: ${left}%;
      font-size: ${size}rem;
      opacity: ${opacity};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      color: ${['#f48fb1', '#d4c5e8', '#f8bbd0', '#d4af37', '#e8e0f0'][Math.floor(Math.random() * 5)]};
    `;

    container.appendChild(el);
  }
})();

/* ================================================================
   4. LIGHTBOX (Klik foto -> tampil besar)
   ================================================================ */
(function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.querySelector('.lightbox-close');

  // Buka lightbox
  document.querySelectorAll('.gallery-item img').forEach(img => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxCaption.textContent = img.alt;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // Tutup
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.classList.add('welcome-done');
  }

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
})();

/* ================================================================
   5. VIDEO PLAYER CUSTOM
   ================================================================ */
(function initVideoPlayer() {
  document.querySelectorAll('.video-item').forEach(item => {
    const video = item.querySelector('.custom-video');
    const playBtn = item.querySelector('.video-play-btn');

    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (video.paused) {
        // Pause semua video lain
        document.querySelectorAll('.custom-video').forEach(v => {
          if (v !== video) v.pause();
        });
        // Reset overlay semua
        document.querySelectorAll('.video-overlay').forEach(o => o.style.display = 'flex');

        video.play();
        item.querySelector('.video-overlay').style.display = 'none';
        playBtn.textContent = '❚❚';
      } else {
        video.pause();
        item.querySelector('.video-overlay').style.display = 'flex';
        playBtn.textContent = '▶';
      }
    });

    // Klik video = toggle play
    video.addEventListener('click', () => playBtn.click());

    // Reset saat video selesai
    video.addEventListener('ended', () => {
      item.querySelector('.video-overlay').style.display = 'flex';
      playBtn.textContent = '▶';
    });

    // Update icon saat play/pause dari control bawaan
    video.addEventListener('play', () => {
      playBtn.textContent = '❚❚';
    });
    video.addEventListener('pause', () => {
      if (!video.ended) {
        item.querySelector('.video-overlay').style.display = 'flex';
        playBtn.textContent = '▶';
      }
    });
  });
})();

/* ================================================================
   6. TIMELINE — Progressive line fill via Intersection Observer
   ================================================================ */
(function initTimeline() {
  const line = document.querySelector('.timeline-container');
  if (!line) return;

  const items = document.querySelectorAll('.timeline-item');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = Array.from(items).indexOf(entry.target);
        const progress = ((idx + 1) / items.length) * 100;
        line.style.setProperty('--timeline-progress', `${progress}%`);
        // Update garis via pseudo-element
        const pseudo = document.createElement('style');
        pseudo.textContent = `
          .timeline-container::before {
            transform: scaleY(${progress / 100});
          }
        `;
        // Hanya tambahkan sekali
        if (!document.getElementById('timeline-style')) {
          pseudo.id = 'timeline-style';
          document.head.appendChild(pseudo);
        }
      }
    });
  }, { threshold: 0.3 });

  items.forEach(item => observer.observe(item));
})();

/* ================================================================
   7. COUNTDOWN REAL-TIME
   ================================================================ */
(function initCountdown() {
  const startDate = new Date('2023-07-01T00:00:00');

  const daysEl = document.getElementById('countdown-days');
  const hoursEl = document.getElementById('countdown-hours');
  const minutesEl = document.getElementById('countdown-minutes');
  const secondsEl = document.getElementById('countdown-seconds');

  function padZero(num) {
    return String(num).padStart(2, '0');
  }

  function animateNumber(el, newVal) {
    const oldVal = parseInt(el.textContent, 10);
    if (oldVal !== newVal) {
      el.textContent = padZero(newVal);
      el.style.transition = 'transform 0.15s ease';
      el.style.transform = 'scale(1.15)';
      setTimeout(() => { el.style.transform = 'scale(1)'; }, 150);
    }
  }

  function updateCountdown() {
    const now = new Date();
    const diff = now - startDate;

    if (diff < 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    animateNumber(daysEl, days);
    animateNumber(hoursEl, hours);
    animateNumber(minutesEl, minutes);
    animateNumber(secondsEl, seconds);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
})();

/* ================================================================
   8. SURAT CINTA — Flip animation on click
   ================================================================ */
(function initLetterFlip() {
  document.querySelectorAll('.letter-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
  });
})();

/* ================================================================
   9. SMOOTH SCROLL UNTUK TOMBOL SCROLL-DOWN
   ================================================================ */
document.querySelector('.scroll-down')?.addEventListener('click', (e) => {
  e.preventDefault();
  const target = document.querySelector('#gallery');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});


