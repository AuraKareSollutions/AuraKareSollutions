const menuToggle = document.querySelector('.menu-toggle');
const primaryNavigation = document.querySelector('.primary-navigation');
const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
const localAssetBase = 'Assets/';

const localAssetSources = {
  '.brand-logo source': `${localAssetBase}Brand_Logo/Branding.mp4`,
  '.footer-logo source': `${localAssetBase}Brand_Logo/Branding.mp4`,
  '.social-link[aria-label="Facebook"] img': `${localAssetBase}Icons/icons8-facebook.gif`,
  '.social-link[aria-label="LinkedIn"] img': `${localAssetBase}Icons/icons8-linkedin-48.gif`,
  '.services-hero-video source': `${localAssetBase}HeroSection/Service Bars.mp4`,
  '.hero-video source': `${localAssetBase}HeroSection/Main_Hero.mp4`,
  '.contact-video-background source': `${localAssetBase}Contact Page/Flying_through_geometric_tunnel_1080p_20260914140440.mp4`,
  'input[value="request-a-meeting"] + .contact-intent-logo': `${localAssetBase}Contact%20Page/request-a-meeting-organic-alt-1.png`,
  'input[value="careers"] + .contact-intent-logo': `${localAssetBase}Contact%20Page/careers-icon-new.png`,
  'input[value="general-inquiries"] + .contact-intent-logo': `${localAssetBase}Contact%20Page/general-inquiries-icon-only.png`
};

Object.entries(localAssetSources).forEach(([selector, source]) => {
  const element = document.querySelector(selector);
  if (element) {
    if (element.tagName === 'SOURCE') {
      element.src = source;
      element.parentElement.load();
    } else {
      element.src = source;
    }
  }
});

const serviceVideoByPage = {
  'document-scanning.html': `${localAssetBase}Services_VidBOX/DocScan_VidBOX.mp4`,
  'bpo-workflows.html': `${localAssetBase}Services_VidBOX/BPO_WorkFlow_VidBOX.mp4`,
  'legacy-data-transformation.html': `${localAssetBase}Services_VidBOX/Leg_Data_VidBOX.mp4`,
  'ai-ready-processing.html': `${localAssetBase}Services_VidBOX/AI_Ready_VidBOX.mp4`
};

const currentPage = window.location.pathname.split('/').pop().split('?')[0];

const encodingFixes = [
  [String.fromCharCode(0xe2, 0x20ac, 0x201d), '-'],
  [String.fromCharCode(0xe2, 0x20ac, 0x2122), "'"],
  [String.fromCharCode(0xe2, 0x20ac, 0x153), '"'],
  [String.fromCharCode(0xe2, 0x20ac, 0x160), '"']
];
const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
let textNode;
while ((textNode = textWalker.nextNode())) {
  encodingFixes.forEach(([corruptText, replacement]) => {
    textNode.nodeValue = textNode.nodeValue.replaceAll(corruptText, replacement);
  });
}

const serviceVideoSource = serviceVideoByPage[currentPage];
if (serviceVideoSource) {
  document.querySelectorAll('.service-video-box').forEach((videoBox) => {
    const video = document.createElement('video');

    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.src = serviceVideoSource;
    videoBox.replaceChildren(video);
    video.load();
  });
}

if (currentPage === 'bpo-workflows.html') {
  const bpoVideo = document.querySelector('#bpo-workflows .service-video-box');
  const bpoCoverage = document.querySelector('#bpo-workflows .service-more-copy');

  if (bpoVideo && bpoCoverage) {
    bpoCoverage.classList.add('bpo-workflow-coverage');
  }
}

const securityVideoByCard = {
  '.security-media-facility': `${localAssetBase}Data Security/Physical & Operational Controls.mp4`,
  '.security-media-data': `${localAssetBase}Data Security/Data Protection Controls.mp4`,
  '.security-media-people': `${localAssetBase}Data Security/Employee Confidentiality.mp4`,
  '.security-media-recovery': `${localAssetBase}Data Security/Continuity Planning_ServCard.mp4?v=continuity-servcard-20260927`
};

if (currentPage === 'data-security.html') {
  Object.entries(securityVideoByCard).forEach(([selector, videoSource]) => {
    const videoBox = document.querySelector(selector);
    if (!videoBox) {
      return;
    }

    const video = document.createElement('video');

    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.src = videoSource;
    videoBox.replaceChildren(video);
    video.load();
  });
}

const aboutBackground = document.querySelector('.hero-background');

if (aboutBackground) {
  const barColors = ['#02264a', '#033b6d', '#00558f', '#0874bb', '#1594dd', '#0a477e'];
  const columns = 84;
  const rows = 10;
  const animationSeconds = 9;
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < columns * rows; index += 1) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const isDarkBlock = (column >= 17 && column <= 24 && row <= 1)
      || (column >= 32 && column <= 37 && row >= 2 && row <= 4)
      || (column >= 51 && column <= 58 && row >= 4 && row <= 6)
      || (column >= 5 && column <= 10 && row >= 7);
    const bar = document.createElement('span');

    bar.className = 'hero-background__bar';
    bar.style.backgroundColor = isDarkBlock
      ? '#031d36'
      : barColors[(column + row * 2) % barColors.length];
    const isMiddleRow = row === Math.floor(rows / 2);
    const isRightToLeft = row % 2 === 1;
    const middleLeft = columns / 2 - 1;
    const middleDistance = Math.min(
      Math.abs(column - middleLeft),
      Math.abs(column - (middleLeft + 1)),
    );
    const progress = isMiddleRow
      ? middleDistance / (columns / 2)
      : (isRightToLeft ? columns - 1 - column : column) / columns;

    bar.style.animationDelay = `-${(progress * animationSeconds).toFixed(2)}s`;
    bar.style.opacity = isDarkBlock
      ? '0.82'
      : String(0.2 + (row / rows) * 0.68 + (column % 5) * 0.025);
    fragment.appendChild(bar);
  }

  aboutBackground.appendChild(fragment);
}

document.querySelectorAll('.navigation-link, .footer-sectors a').forEach((link) => {
  if (link.textContent.trim() === 'Sectors') {
    link.href = 'sectors.html';
  }
});

document.querySelectorAll('.footer-sectors h2').forEach((heading) => {
  if (!heading.querySelector('a')) {
    heading.innerHTML = '<a href="sectors.html">Sectors</a>';
  }
});

const inquiryTypeInputs = document.querySelectorAll('input[name="inquiry-type"]');
const contactFormPanels = document.querySelectorAll('.contact-form-panel');
const meetingTitle = document.getElementById('meeting-title');
const careersTitle = document.getElementById('careers-title');
const panelCopy = document.querySelector('.contact-panel-copy');
const careersCopy = document.getElementById('careers-copy');

const updateInquiryState = () => {
  const selectedInquiry = document.querySelector('input[name="inquiry-type"]:checked')?.value || 'careers';

  contactFormPanels.forEach((panel) => {
    panel.hidden = panel.dataset.inquiry !== selectedInquiry;
  });

  if (selectedInquiry === 'careers') {
    if (meetingTitle) {
      meetingTitle.textContent = 'Careers';
    }
    if (panelCopy) {
      panelCopy.textContent = 'The more context you share, the better we can help.';
    }
    return;
  }

  if (meetingTitle) {
    meetingTitle.textContent = 'Request a Meeting';
  }
  if (panelCopy) {
    panelCopy.textContent = 'Want to see what outsourcing your next project will cost you? Enter your project details below and get a free quote.';
  }
};

inquiryTypeInputs.forEach((input) => {
  input.addEventListener('change', updateInquiryState);
});

updateInquiryState();

const servicesEyebrow = document.querySelector('.services-hero .services-eyebrow');
const servicesTitle = document.querySelector('.services-hero h1');

if (servicesEyebrow && servicesTitle) {
  servicesEyebrow.innerHTML = '<span class="service-breadcrumb-prefix">Our Service</span><span class="service-breadcrumb-path"> / ' + servicesTitle.textContent + '</span>';
}

const pageConfigs = {
  'document-scanning-title': {
    subtitle: 'Empowering organizations and public agencies, AuraKare Sollutions digitizes physical document backlogs via secure scanning and indexing to deliver access-ready records.',
    heading: '<span class="service-title-blue">Digitize documentation</span> with precision, ensuring that operational frameworks and contextual meanings are never lost in translation.'
  },
  'legacy-data-title': {
    subtitle: 'At AuraKare Sollutions, we deliver precision-driven, cost-effective solutions for your most critical data entry and document conversion needs. Backed by cutting-edge technology and rigorous quality assurance protocols, we ensure 99.999% accuracy, rapid project deployment, and highly competitive pricing to keep your operations running seamlessly.',
    heading: 'Data Entry &amp; Data <span class="service-title-blue">Services</span>'
  },
  'bpo-workflows-title': {
    subtitle: 'We empower healthcare organizations by transforming complex administrative bottlenecks into highly scalable, error-free operations. Our digitally orchestrated RCM workflows ensure maximum revenue realization, strict compliance, and rapid turnaround times.',
    heading: '<span class="service-title-blue">Manage high-volume workflows</span> where scale, dependability, and rapid turnaround are critical.'
  },
  'ai-ready-title': {
    subtitle: 'High-performance AI begins with high-quality data. Unstructured, unlabeled datasets create critical bottlenecks that slow down model training and deployment. At AuraKare Sollutions, we solve this challenge by transforming messy, fragmented information into structured, precisely annotated training assets engineered to power reliable AI outcomes.',
    heading: '<span class="service-title-blue">AuraKare Sollutions Data Labeling &amp; Annotation Services</span><br>For Machine Learning &amp; AI'
  }
};

const targetTitle = document.querySelector('#document-scanning-title, #legacy-data-title, #bpo-workflows-title, #ai-ready-title');

if (targetTitle) {
  const config = pageConfigs[targetTitle.id];
  if (config) {
    const subtitle = document.createElement('h3');
    subtitle.className = 'service-title-subtitle';
    subtitle.innerHTML = config.heading;
    targetTitle.after(subtitle);

    if (config.subtitle) {
      const intro = document.createElement('p');
      intro.className = 'service-intro-subtitle';
      intro.innerHTML = config.subtitle;
      subtitle.after(intro);
    }
  }
}

document.querySelectorAll('.case-studies-button').forEach((button) => {
  if (document.querySelector('#legacy-data-transformation, #ai-ready-processing')) {
    button.remove();
    return;
  }

  button.href = 'get-in-touch.html';
  button.textContent = 'Connect With Us';
});

const serviceFollowUp = {
  'legacy-data-transformation': {
    heading: 'Make Legacy Data Work Harder',
    copy: 'We convert complex historical and operational content into structured, searchable data that is ready for modern workflows, migration, and analysis.',
    badges: ['Structured Data', 'Quality Controlled', 'Migration Ready']
  },
  'ai-ready-processing': {
    heading: 'Prepare Data for What Comes Next',
    copy: 'We organize, validate, and enrich operational data so teams can build reliable automation and AI workflows on a clear, consistent foundation.',
    badges: ['AI-Ready Data', 'Validated Outputs', 'Scalable Workflows']
  }
};

Object.entries(serviceFollowUp).forEach(([serviceId, content]) => {
  const feature = document.getElementById(serviceId);
  const videoBox = feature?.querySelector('.service-video-box');

  if (!feature || !videoBox) {
    return;
  }

  const followUp = document.createElement('div');
  followUp.className = 'service-follow-up-copy';
  followUp.innerHTML = `<h4>${content.heading}</h4><p>${content.copy}</p><div class="service-follow-up-badges">${content.badges.map((badge) => `<span><span class="certification-dot"></span>${badge}</span>`).join('')}</div><a class="service-follow-up-button" href="get-in-touch.html">Connect With Us</a>`;

  const rightColumn = document.createElement('div');
  rightColumn.className = 'service-follow-up-right';
  videoBox.replaceWith(rightColumn);
  rightColumn.append(videoBox, followUp);

  if (serviceId === 'legacy-data-transformation') {
    const button = followUp.querySelector('.service-follow-up-button');
    const serviceItem = feature.querySelector('.service-item');

    if (button && serviceItem) {
      serviceItem.append(button);
    }
  }
});

const bpoFeature = document.querySelector('#bpo-workflows');

if (bpoFeature) {
  const bpoItem = bpoFeature.querySelector('.service-item');
  const bpoVideo = bpoFeature.querySelector('.service-video-box');
  const bpoMore = bpoFeature.querySelector('.service-more-copy');
  const bpoBanner = bpoFeature.querySelector('.service-cta-banner');

  if (bpoItem && bpoVideo && bpoMore && bpoBanner) {
    const bpoServices = bpoItem.querySelectorAll('.data-rte-list li');
    const conciseBpoServices = [
      'Prior Auth & Pre-Certification',
      'Medical Coding',
      'Charge Entry & Encounter Capture',
      'Claim Scrubbing & E-Submission',
      'Clearinghouse Rejection Management',
      'Payment Posting & ERA/EOB Reconciliation',
      'Denials & Corrected Claims',
      'A/R & Claim Appeals',
      'Secondary & Tertiary Claim Filing',
      'Credit Balance & Refund Audits'
    ];

    bpoServices.forEach((service, index) => {
      if (conciseBpoServices[index]) {
        service.textContent = conciseBpoServices[index];
      }
    });

    const bpoColumnNote = document.createElement('aside');
    bpoColumnNote.className = 'bpo-column-note';
    bpoColumnNote.innerHTML = '<a class="bpo-column-note-cta" href="index.html#get-in-touch">Get in Touch</a><div class="bpo-column-note-copy"><span>Workflow coverage</span><strong>From intake to payment</strong><small>One coordinated process for every claim.</small></div>';
    bpoItem.append(bpoColumnNote);

    const bpoRight = document.createElement('div');
    bpoRight.className = 'service-bpo-right';
    bpoFeature.insertBefore(bpoRight, bpoVideo);

    bpoRight.append(bpoVideo, bpoMore);

    const bpoBadges = document.createElement('div');
    bpoBadges.className = 'service-trust-badges';
    bpoBadges.setAttribute('aria-label', 'Compliance credentials');
    bpoBadges.innerHTML = '<span><i class="certification-dot"></i>HIPAA</span><span><i class="certification-dot"></i>ISO 27001</span><span><i class="certification-dot"></i>SOC</span><span><i class="certification-dot"></i>24/7 Servicing</span>';
    bpoMore.append(bpoBadges);
  }
}


menuToggle.addEventListener('click', () => {
  const isOpen = primaryNavigation.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

dropdownToggles.forEach((toggle) => {
  toggle.addEventListener('click', () => {
    if (toggle.tagName === 'A') {
      return;
    }

    const dropdown = toggle.closest('.has-dropdown');
    const isOpen = dropdown.classList.toggle('is-open');

    toggle.setAttribute('aria-expanded', String(isOpen));

    dropdownToggles.forEach((otherToggle) => {
      const otherDropdown = otherToggle.closest('.has-dropdown');
      if (otherToggle !== toggle) {
        otherDropdown.classList.remove('is-open');
        otherToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.site-header')) {
    primaryNavigation.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');

    dropdownToggles.forEach((toggle) => {
      toggle.closest('.has-dropdown').classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  }
});

if ('IntersectionObserver' in window) {
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;

      if (entry.isIntersecting) {
        video.preload = 'auto';
        video.play().catch(() => {});
      } else if (!video.paused) {
        video.pause();
        video.preload = 'metadata';
      }
    });
  }, { rootMargin: '300px 0px' });

  document.querySelectorAll('video').forEach((video) => {
    videoObserver.observe(video);
  });
}

/* Privacy-friendly cookie consent. Essential site storage is always available; optional categories are off by default. */
(() => {
  const consentKey = 'aurakare_cookie_consent';
  const readConsent = () => {
    try {
      return JSON.parse(localStorage.getItem(consentKey) || 'null');
    } catch {
      return null;
    }
  };
  const saveConsent = (value) => {
    try {
      localStorage.setItem(consentKey, JSON.stringify({ ...value, updatedAt: new Date().toISOString() }));
    } catch {
      // Continue without persistence if browser storage is unavailable.
    }
  };

  const existingConsent = readConsent();
  const banner = document.createElement('aside');
  banner.className = 'cookie-consent-banner';
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML = `
    <div class="cookie-consent-copy">
      <p class="cookie-consent-eyebrow">Your privacy matters</p>
      <h2>We use cookies</h2>
      <p>We use essential storage to make this website work. With your permission, we may also use optional cookies to understand site usage and improve your experience. Read our <a href="privacy-policy.html#cookies">Privacy and Cookie Policy</a>.</p>
    </div>
    <div class="cookie-consent-actions">
      <button type="button" class="cookie-button cookie-button-secondary" data-cookie-action="reject">Reject unnecessary</button>
      <button type="button" class="cookie-button cookie-button-secondary" data-cookie-action="manage">Manage preferences</button>
      <button type="button" class="cookie-button cookie-button-primary" data-cookie-action="accept">Accept all</button>
    </div>`;

  const modal = document.createElement('div');
  modal.className = 'cookie-preferences-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'cookie-preferences-title');
  modal.hidden = true;
  modal.innerHTML = `
    <div class="cookie-preferences-backdrop" data-cookie-action="close"></div>
    <div class="cookie-preferences-card">
      <button type="button" class="cookie-preferences-close" aria-label="Close cookie preferences" data-cookie-action="close">&times;</button>
      <p class="cookie-consent-eyebrow">Privacy choices</p>
      <h2 id="cookie-preferences-title">Cookie preferences</h2>
      <p>Choose which optional categories you allow. You can change these choices at any time using Cookie Settings.</p>
      <div class="cookie-preference-row">
        <div><strong>Essential</strong><span>Required for core site functions and your consent choice.</span></div>
        <strong class="cookie-preference-status">Always on</strong>
      </div>
      <label class="cookie-preference-row cookie-preference-toggle">
        <div><strong>Analytics</strong><span>Google Analytics 4 helps us understand visits and improve the website. Only enabled with your permission.</span></div>
        <input type="checkbox" data-cookie-category="analytics">
      </label>
      <label class="cookie-preference-row cookie-preference-toggle">
        <div><strong>Marketing</strong><span>Used to personalize marketing and measure campaigns. No marketing cookies are currently activated.</span></div>
        <input type="checkbox" data-cookie-category="marketing">
      </label>
      <div class="cookie-preferences-actions">
        <button type="button" class="cookie-button cookie-button-secondary" data-cookie-action="reject">Reject unnecessary</button>
        <button type="button" class="cookie-button cookie-button-primary" data-cookie-action="save">Save preferences</button>
      </div>
    </div>`;

  const settingsButton = document.createElement('button');
  settingsButton.type = 'button';
  settingsButton.className = 'cookie-settings-trigger';
  settingsButton.textContent = 'Cookie Settings';
  settingsButton.setAttribute('aria-label', 'Open cookie settings');
  settingsButton.dataset.cookieAction = 'manage';

  document.body.append(banner, modal, settingsButton);

  const setVisible = (element, visible) => {
    element.hidden = !visible;
    element.classList.toggle('is-visible', visible);
  };
  const closePreferences = () => setVisible(modal, false);
  const enableAnalytics = () => {
    if (window.__aurakareAnalyticsLoaded) {
      return;
    }

    window.__aurakareAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('config', 'G-0DP7X434XL', { anonymize_ip: true });

    const analyticsScript = document.createElement('script');
    analyticsScript.async = true;
    analyticsScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-0DP7X434XL';
    document.head.appendChild(analyticsScript);
  };
  const applyConsent = (choice) => {
    saveConsent(choice);
    if (choice.analytics) {
      enableAnalytics();
    }
    closePreferences();
    setVisible(banner, false);
  };
  const openPreferences = () => {
    const choice = readConsent() || {};
    modal.querySelector('[data-cookie-category="analytics"]').checked = choice.analytics === true;
    modal.querySelector('[data-cookie-category="marketing"]').checked = choice.marketing === true;
    setVisible(modal, true);
    modal.querySelector('.cookie-preferences-close').focus();
  };

  banner.querySelectorAll('[data-cookie-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.cookieAction;
      if (action === 'accept') applyConsent({ essential: true, analytics: true, marketing: true });
      if (action === 'reject') applyConsent({ essential: true, analytics: false, marketing: false });
      if (action === 'manage') openPreferences();
    });
  });
  modal.querySelectorAll('[data-cookie-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.cookieAction;
      if (action === 'close') closePreferences();
      if (action === 'reject') applyConsent({ essential: true, analytics: false, marketing: false });
      if (action === 'save') applyConsent({
        essential: true,
        analytics: modal.querySelector('[data-cookie-category="analytics"]').checked,
        marketing: modal.querySelector('[data-cookie-category="marketing"]').checked
      });
    });
  });
  settingsButton.addEventListener('click', openPreferences);
  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePreferences();
  });

  if (existingConsent) {
    setVisible(banner, false);
    if (existingConsent.analytics === true) {
      enableAnalytics();
    }
  } else {
    setVisible(banner, true);
  }
})();
