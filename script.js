/* ========================================
   PromptLab — Universal JavaScript
   Version: 1.0.0
   ======================================== */

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    /* ===== DOM refs ===== */
    const header = document.querySelector('.header');
    const hamburger = document.querySelector('.hamburger');
    const navWrapper = document.querySelector('.nav-wrapper');
    const navLinks = document.querySelectorAll('.nav-links a');
    const copyButtons = document.querySelectorAll('.btn-copy');
    const shareButtons = document.querySelectorAll('.btn-share');

    // ============================================================
    //  SVG ICONS (all using --color-primary = #0a0a0a)
    //  We define them here so we can inject into buttons
    // ============================================================

    const ICON_COPY = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
    `;

    const ICON_COPY_CHECK = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    `;

    const ICON_SHARE = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
    `;

    const ICON_HAMBURGER = `
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
    `;

    // Inject hamburger icon (in case HTML uses emoji, we replace)
    if (hamburger) {
        // If hamburger already has children, we might want to replace them,
        // but we'll assume we use the bar spans inside.
        // We'll ensure it has the proper structure.
        // We'll just leave it as is because the CSS expects .bar spans.
        // But we can also set innerHTML to our bars.
        // We'll not override to keep flexibility.
    }

    // ============================================================
    //  HAMBURGER TOGGLE
    // ============================================================

    if (hamburger && navWrapper) {
        hamburger.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpen = navWrapper.classList.toggle('open');
            hamburger.classList.toggle('active');
            // aria-expanded for accessibility
            hamburger.setAttribute('aria-expanded', isOpen);
        });

        // Close nav on link click (mobile)
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                navWrapper.classList.remove('open');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });

        // Close on outside click
        document.addEventListener('click', function (e) {
            if (navWrapper.classList.contains('open')) {
                const target = e.target;
                if (!navWrapper.contains(target) && !hamburger.contains(target)) {
                    navWrapper.classList.remove('open');
                    hamburger.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }

    // ============================================================
    //  ACTIVE NAV LINK (based on current URL)
    // ============================================================

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
        } else if (currentPath === '' && href === 'index.html') {
            // if we are on root and link points to index.html
            link.classList.add('active');
        } else if (currentPath === 'index.html' && href === 'index.html') {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // ============================================================
    //  HEADER SCROLL EFFECT
    // ============================================================

    let lastScrollY = 0;
    window.addEventListener('scroll', function () {
        const scrollY = window.scrollY;
        if (scrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        lastScrollY = scrollY;
    }, { passive: true });

    // ============================================================
    //  COPY BUTTON
    // ============================================================

    copyButtons.forEach(btn => {
        // Store original HTML (we'll add icon inside)
        // We'll set the button content: icon + text
        // But we need to preserve the text. We'll add icon before text.
        const originalText = btn.textContent.trim();
        // Clear and rebuild
        btn.innerHTML = '';
        // Add icon
        const iconSpan = document.createElement('span');
        iconSpan.className = 'btn-icon-svg';
        iconSpan.style.display = 'inline-flex';
        iconSpan.style.alignItems = 'center';
        iconSpan.style.justifyContent = 'center';
        iconSpan.style.marginRight = '0.3rem';
        iconSpan.innerHTML = ICON_COPY;
        btn.appendChild(iconSpan);
        // Add text node
        const textNode = document.createTextNode(' ' + originalText);
        btn.appendChild(textNode);

        // Store the original text for reset
        btn.dataset.originalText = originalText;

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            // Find the prompt text - the button is inside .actions, parent .body, sibling .prompt-text
            const card = this.closest('.prompt-card');
            if (!card) return;
            const promptTextEl = card.querySelector('.prompt-text');
            if (!promptTextEl) return;
            // Get text content, but remove the label if present
            let textToCopy = promptTextEl.textContent.trim();
            // If there is a label span inside, we might want to exclude it, but we'll copy everything.
            // Better: copy the inner text without the label? We'll copy the entire text content.
            // We'll just use innerText to get visible text.
            textToCopy = promptTextEl.innerText.trim();

            // Copy to clipboard
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    showCopiedFeedback(this);
                }).catch(() => {
                    fallbackCopy(textToCopy, this);
                });
            } else {
                fallbackCopy(textToCopy, this);
            }
        });
    });

    function fallbackCopy(text, btn) {
        // Use textarea fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showCopiedFeedback(btn);
        } catch (err) {
            console.warn('Copy failed', err);
            alert('Could not copy. Please select and copy manually.');
        }
        document.body.removeChild(textarea);
    }

    function showCopiedFeedback(btn) {
        // Change icon and text
        const iconSpan = btn.querySelector('.btn-icon-svg');
        if (iconSpan) {
            iconSpan.innerHTML = ICON_COPY_CHECK;
        }
        // Change text
        const textNode = btn.childNodes[1]; // second child is text node
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
            textNode.textContent = ' Copied!';
        }
        btn.classList.add('copied');

        // Reset after 2s
        setTimeout(() => {
            if (iconSpan) {
                iconSpan.innerHTML = ICON_COPY;
            }
            const originalText = btn.dataset.originalText || 'Copy';
            const textNodeReset = btn.childNodes[1];
            if (textNodeReset && textNodeReset.nodeType === Node.TEXT_NODE) {
                textNodeReset.textContent = ' ' + originalText;
            }
            btn.classList.remove('copied');
        }, 2000);
    }

    // ============================================================
    //  SHARE BUTTON
    // ============================================================

    shareButtons.forEach(btn => {
        // Rebuild with SVG icon
        const originalText = btn.textContent.trim();
        btn.innerHTML = '';
        const iconSpan = document.createElement('span');
        iconSpan.className = 'btn-icon-svg';
        iconSpan.style.display = 'inline-flex';
        iconSpan.style.alignItems = 'center';
        iconSpan.style.justifyContent = 'center';
        iconSpan.style.marginRight = '0.3rem';
        iconSpan.innerHTML = ICON_SHARE;
        btn.appendChild(iconSpan);
        const textNode = document.createTextNode(' ' + originalText);
        btn.appendChild(textNode);
        btn.dataset.originalText = originalText;

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            // Find prompt text
            const card = this.closest('.prompt-card');
            if (!card) return;
            const promptTextEl = card.querySelector('.prompt-text');
            if (!promptTextEl) return;
            const textToShare = promptTextEl.innerText.trim();

            // Use Web Share API if available
            if (navigator.share) {
                navigator.share({
                    title: 'Prompt from PromptLab',
                    text: textToShare,
                    url: window.location.href,
                }).catch(err => {
                    if (err.name !== 'AbortError') {
                        console.warn('Share failed', err);
                        fallbackShare(textToShare);
                    }
                });
            } else {
                fallbackShare(textToShare);
            }
        });
    });

    function fallbackShare(text) {
        // Copy to clipboard as fallback
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                alert('Prompt copied to clipboard! You can share it now.');
            }).catch(() => {
                // Last resort: prompt user to copy
                prompt('Copy this prompt manually:', text);
            });
        } else {
            prompt('Copy this prompt manually:', text);
        }
    }

    // ============================================================
    //  ADDITIONAL: Ensure all SVG icons inherit primary color via CSS
    //  We set stroke="currentColor" and fill="none" where appropriate.
    //  The parent button text color will be applied.
    // ============================================================

    console.log('PromptLab — scripts loaded.');
});
