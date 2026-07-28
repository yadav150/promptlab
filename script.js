/* ========================================
   PromptLab — Universal JavaScript
   Version: 2.0.0 (with Pagination)
   ======================================== */

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // ============================================================
    //  DOM refs
    // ============================================================
    const header = document.querySelector('.header');
    const hamburger = document.querySelector('.hamburger');
    const navWrapper = document.querySelector('.nav-wrapper');
    const navLinks = document.querySelectorAll('.nav-links a');

    // ============================================================
    //  SVG ICONS
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

    // ============================================================
    //  HAMBURGER TOGGLE
    // ============================================================
    if (hamburger && navWrapper) {
        hamburger.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpen = navWrapper.classList.toggle('open');
            hamburger.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isOpen);
        });

        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                navWrapper.classList.remove('open');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });

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
    //  ACTIVE NAV LINK
    // ============================================================
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
        } else if (currentPath === '' && href === 'index.html') {
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
    window.addEventListener('scroll', function () {
        if (window.scrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });

    // ============================================================
    //  PAGINATION — 6 cards per page
    // ============================================================
    const CARDS_PER_PAGE = 6;

    function initPagination() {
        const grid = document.querySelector('.prompt-grid');
        if (!grid) return;

        const cards = grid.querySelectorAll('.prompt-card');
        if (cards.length <= CARDS_PER_PAGE) {
            // Hide pagination if not needed
            const paginationEl = document.getElementById('pagination');
            if (paginationEl) paginationEl.style.display = 'none';
            // Show all cards
            cards.forEach(c => c.style.display = '');
            return;
        }

        const totalPages = Math.ceil(cards.length / CARDS_PER_PAGE);
        let currentPage = 1;

        // Create pagination container if it doesn't exist
        let paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.id = 'pagination';
            paginationContainer.className = 'pagination';
            grid.parentNode.insertBefore(paginationContainer, grid.nextSibling);
        } else {
            paginationContainer.style.display = '';
        }

        // ---- Render function ----
        function renderPage(page) {
            currentPage = page;

            // Show/hide cards
            cards.forEach((card, index) => {
                const start = (currentPage - 1) * CARDS_PER_PAGE;
                const end = start + CARDS_PER_PAGE;
                card.style.display = (index >= start && index < end) ? '' : 'none';
            });

            // Build pagination HTML
            let html = '';

            // Prev button
            const prevDisabled = currentPage === 1;
            html += `<button class="pagination-prev" ${prevDisabled ? 'disabled' : ''} data-page="${currentPage - 1}">Previous</button>`;

            // Page numbers
            const maxVisible = 5;
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, currentPage + 2);

            if (endPage - startPage < maxVisible - 1) {
                if (startPage === 1) {
                    endPage = Math.min(totalPages, startPage + maxVisible - 1);
                } else if (endPage === totalPages) {
                    startPage = Math.max(1, endPage - maxVisible + 1);
                }
            }

            if (startPage > 1) {
                html += `<button class="pagination-page" data-page="1">1</button>`;
                if (startPage > 2) {
                    html += `<span class="pagination-ellipsis">…</span>`;
                }
            }

            for (let i = startPage; i <= endPage; i++) {
                const active = i === currentPage ? 'active' : '';
                html += `<button class="pagination-page ${active}" data-page="${i}">${i}</button>`;
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    html += `<span class="pagination-ellipsis">…</span>`;
                }
                html += `<button class="pagination-page" data-page="${totalPages}">${totalPages}</button>`;
            }

            // Next button
            const nextDisabled = currentPage === totalPages;
            html += `<button class="pagination-next" ${nextDisabled ? 'disabled' : ''} data-page="${currentPage + 1}">Next</button>`;

            paginationContainer.innerHTML = html;

            // ---- Attach events ----
            paginationContainer.querySelectorAll('button[data-page]').forEach(btn => {
                btn.addEventListener('click', function () {
                    const page = parseInt(this.dataset.page, 10);
                    if (page >= 1 && page <= totalPages && page !== currentPage) {
                        renderPage(page);
                        // Scroll to top of grid
                        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            });
        }

        // ---- Initial render ----
        renderPage(1);
    }

    // ============================================================
    //  COPY / SHARE — using event delegation for dynamic cards
    // ============================================================
    function setupCopyShare() {
        // Copy buttons
        document.addEventListener('click', function (e) {
            const btn = e.target.closest('.btn-copy');
            if (!btn) return;

            e.preventDefault();
            const card = btn.closest('.prompt-card');
            if (!card) return;
            const promptTextEl = card.querySelector('.prompt-text');
            if (!promptTextEl) return;

            let textToCopy = promptTextEl.innerText.trim();

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    showCopiedFeedback(btn);
                }).catch(() => {
                    fallbackCopy(textToCopy, btn);
                });
            } else {
                fallbackCopy(textToCopy, btn);
            }
        });

        // Share buttons
        document.addEventListener('click', function (e) {
            const btn = e.target.closest('.btn-share');
            if (!btn) return;

            e.preventDefault();
            const card = btn.closest('.prompt-card');
            if (!card) return;
            const promptTextEl = card.querySelector('.prompt-text');
            if (!promptTextEl) return;

            const textToShare = promptTextEl.innerText.trim();

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
    }

    // ---- Helper functions ----
    function fallbackCopy(text, btn) {
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
        // Find or create the icon span
        let iconSpan = btn.querySelector('.btn-icon-svg');
        if (!iconSpan) {
            // If button was built without icon, rebuild it
            const originalText = btn.dataset.originalText || btn.textContent.trim() || 'Copy';
            btn.innerHTML = '';
            iconSpan = document.createElement('span');
            iconSpan.className = 'btn-icon-svg';
            iconSpan.style.display = 'inline-flex';
            iconSpan.style.alignItems = 'center';
            iconSpan.style.justifyContent = 'center';
            iconSpan.style.marginRight = '0.3rem';
            btn.appendChild(iconSpan);
            const textNode = document.createTextNode(' ' + originalText);
            btn.appendChild(textNode);
            btn.dataset.originalText = originalText;
        }

        // Change to checkmark
        iconSpan.innerHTML = ICON_COPY_CHECK;
        const textNode = btn.childNodes[1];
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
            textNode.textContent = ' Copied!';
        }
        btn.classList.add('copied');

        setTimeout(() => {
            iconSpan.innerHTML = ICON_COPY;
            const originalText = btn.dataset.originalText || 'Copy';
            const textNodeReset = btn.childNodes[1];
            if (textNodeReset && textNodeReset.nodeType === Node.TEXT_NODE) {
                textNodeReset.textContent = ' ' + originalText;
            }
            btn.classList.remove('copied');
        }, 2000);
    }

    function fallbackShare(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                alert('Prompt copied to clipboard! You can share it now.');
            }).catch(() => {
                prompt('Copy this prompt manually:', text);
            });
        } else {
            prompt('Copy this prompt manually:', text);
        }
    }

    // ---- Ensure copy buttons have icons on load ----
    function ensureButtonIcons() {
        document.querySelectorAll('.btn-copy').forEach(btn => {
            if (!btn.querySelector('.btn-icon-svg')) {
                const originalText = btn.textContent.trim() || 'Copy';
                btn.innerHTML = '';
                const iconSpan = document.createElement('span');
                iconSpan.className = 'btn-icon-svg';
                iconSpan.style.display = 'inline-flex';
                iconSpan.style.alignItems = 'center';
                iconSpan.style.justifyContent = 'center';
                iconSpan.style.marginRight = '0.3rem';
                iconSpan.innerHTML = ICON_COPY;
                btn.appendChild(iconSpan);
                const textNode = document.createTextNode(' ' + originalText);
                btn.appendChild(textNode);
                btn.dataset.originalText = originalText;
            }
        });

        document.querySelectorAll('.btn-share').forEach(btn => {
            if (!btn.querySelector('.btn-icon-svg')) {
                const originalText = btn.textContent.trim() || 'Share';
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
            }
        });
    }

    // ============================================================
    //  INIT
    // ============================================================
    ensureButtonIcons();
    setupCopyShare();
    initPagination();

    console.log('PromptLab — scripts loaded with pagination.');
});
