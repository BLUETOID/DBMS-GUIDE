/**
 * SQL Visual Query Catalog Helper
 * Features:
 * - Instant live search across all query examples
 * - One-click SQL snippet copy to clipboard
 * - Smooth topic navigation with active pill highlighting
 * - Practice challenge collapsible solutions
 */

document.addEventListener('DOMContentLoaded', () => {
    initCatalogSearch();
    initCopyButtons();
    initCategoryPills();
    initChallengeToggles();
});

// 1. Instant Live Search
function initCatalogSearch() {
    const searchInput = document.getElementById('catalogSearchInput');
    const countBadge = document.getElementById('exampleCountBadge');
    const cards = document.querySelectorAll('.query-example-card');
    const sections = document.querySelectorAll('.catalog-module-section');

    if (!searchInput || !cards.length) return;

    const totalCount = cards.length;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        let visibleCount = 0;

        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            const sqlText = card.querySelector('pre') ? card.querySelector('pre').textContent.toLowerCase() : '';
            const match = text.includes(query) || sqlText.includes(query);

            if (match) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Hide empty module sections during search
        sections.forEach(sec => {
            const secCards = sec.querySelectorAll('.query-example-card');
            const hasVisible = Array.from(secCards).some(c => c.style.display !== 'none');
            sec.style.display = hasVisible ? 'block' : 'none';
        });

        if (countBadge) {
            if (query === '') {
                countBadge.textContent = `${totalCount} Visual Examples`;
            } else {
                countBadge.textContent = `${visibleCount} of ${totalCount} Examples`;
            }
        }
    });
}

// 2. One-Click Copy SQL to Clipboard
function initCopyButtons() {
    document.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.btn-code-copy');
        if (!copyBtn) return;

        const card = copyBtn.closest('.query-example-card');
        if (!card) return;

        const codeEl = card.querySelector('pre code') || card.querySelector('pre');
        if (!codeEl) return;

        const sql = codeEl.innerText.trim();
        navigator.clipboard.writeText(sql).then(() => {
            const originalHtml = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check" style="color: #10b981;"></i> Copied!';
            copyBtn.style.color = '#10b981';
            setTimeout(() => {
                copyBtn.innerHTML = originalHtml;
                copyBtn.style.color = '';
            }, 2000);
        }).catch(err => {
            console.error('Clipboard copy failed:', err);
        });
    });
}

// 3. Category Pill Navigation
function initCategoryPills() {
    const pills = document.querySelectorAll('.cat-pill');
    pills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
        });
    });
}

// 4. Collapsible Challenge Answers
function initChallengeToggles() {
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.challenge-question');
        if (!trigger) return;

        const solution = trigger.nextElementSibling;
        if (solution && solution.classList.contains('challenge-solution')) {
            solution.classList.toggle('is-open');
            const icon = trigger.querySelector('i.fa-chevron-down, i.fa-chevron-up');
            if (icon) {
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
            }
        }
    });
}
