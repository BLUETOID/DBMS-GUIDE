// ==========================================================================
// DBMS HUB - CLIENT-SIDE INTERACTIVITY ENGINE
// Engineered in the exact interactivity, UI/UX & quiz logic of Python Guide
// ==========================================================================

// ===== 1. Loading Skeleton =====
const LoadingSkeleton = {
    show() {
        if (document.getElementById('loadingSkeleton')) return;
        const skeleton = document.createElement('div');
        skeleton.className = 'loading-skeleton';
        skeleton.id = 'loadingSkeleton';
        skeleton.innerHTML = `
            <div class="skeleton-header"></div>
            <div class="skeleton-content">
                <div class="skeleton-line long"></div>
                <div class="skeleton-line medium"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-line long"></div>
                <div class="skeleton-line medium"></div>
            </div>
        `;
        document.body.prepend(skeleton);
    },
    
    hide() {
        const skeleton = document.getElementById('loadingSkeleton');
        if (skeleton) {
            skeleton.classList.add('fade-out');
            setTimeout(() => skeleton.remove(), 300);
        }
    }
};

// Show skeleton immediately
LoadingSkeleton.show();

// Hide skeleton when page finishes loading
window.addEventListener('load', () => {
    LoadingSkeleton.hide();
});
// Fallback if load event already fired
setTimeout(() => LoadingSkeleton.hide(), 800);

// ===== 2. Confetti Celebration Effect =====
const ConfettiEffect = {
    trigger() {
        const colors = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#8b5cf6'];
        const container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);
        
        for (let i = 0; i < 90; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 1.5 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            container.appendChild(confetti);
        }
        
        setTimeout(() => container.remove(), 5000);
    }
};

// ===== 3. Smooth Page Transitions =====
const PageTransition = {
    init() {
        document.body.classList.add('page-transition');
        
        document.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.endsWith('.html') && !href.startsWith('http') && !href.startsWith('#') && !link.hasAttribute('target')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.body.classList.add('page-fade-out');
                    setTimeout(() => {
                        window.location.href = href;
                    }, 180);
                });
            }
        });
    }
};

// ===== 4. Breadcrumb Navigation (Disabled as requested) =====
const Breadcrumb = {
    init() {
        // Disabled - breadcrumb element removed to prevent dark bar at top of pages
    }
};

// ===== 5. Dark Mode Management =====
function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDark);
    updateThemeToggleIcons(isDark);
}

function updateThemeToggleIcons(isDark) {
    document.querySelectorAll('.theme-toggle-btn i').forEach(icon => {
        if (isDark) {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    });
}

function initDarkMode() {
    const saved = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved === 'true' || (saved === null && prefersDark);
    
    if (isDark) {
        document.body.classList.add('dark-mode');
    }
    updateThemeToggleIcons(isDark);
}

// ===== 6. Mobile Navigation Toggle =====
function initNavToggle() {
    const navToggle = document.getElementById('navToggle') || document.querySelector('.nav-toggle');
    const navMenu = document.getElementById('navMenu') || document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = navMenu.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isExpanded);
        });

        // Close on navigation link click
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

// ===== 7. Scroll to Top Floating Button =====
function initScrollTop() {
    let scrollTopBtn = document.querySelector('.scroll-top');
    if (!scrollTopBtn) {
        scrollTopBtn = document.createElement('button');
        scrollTopBtn.className = 'scroll-top';
        scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
        scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
        document.body.appendChild(scrollTopBtn);
    }
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 320) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });
    
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===== 8. Copy Code Functionality =====
function initCopyCode() {
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const container = this.closest('.code-example') || this.closest('.code-block') || this.parentElement.parentElement;
            const codeEl = container ? container.querySelector('code') : null;
            if (!codeEl) return;
            
            const text = codeEl.textContent;
            navigator.clipboard.writeText(text).then(() => {
                const originalHtml = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                this.style.background = '#10b981';
                this.style.color = '#ffffff';
                
                setTimeout(() => {
                    this.innerHTML = originalHtml;
                    this.style.background = '';
                    this.style.color = '';
                }, 2000);
            }).catch(err => {
                console.error('Clipboard copy failed:', err);
            });
        });
    });
}

// ===== 9. Smooth Anchor Scrolling with Navbar Offset =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const navHeight = document.querySelector('.navbar')?.offsetHeight || 70;
                const targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;
                window.scrollTo({
                    top: targetPos,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== 10. Sidebar Active Section Highlighting =====
function initSidebarObserver() {
    const sections = document.querySelectorAll('.topic-section[id], section[id]');
    const navLinks = document.querySelectorAll('.sidebar-nav a, .toc-list a');
    
    if (sections.length === 0 || navLinks.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        root: null,
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0
    });
    
    sections.forEach(sec => observer.observe(sec));
}

// ===== 11. Animate on Scroll =====
function initScrollAnimations() {
    const elements = document.querySelectorAll('.unit-card, .feature-card, .topic-section, .cheat-card');
    
    const animate = () => {
        elements.forEach(el => {
            const top = el.getBoundingClientRect().top;
            if (top < window.innerHeight - 80) {
                el.classList.add('fade-in');
            }
        });
    };
    
    window.addEventListener('scroll', animate, { passive: true });
    animate();
}

// ===== 12. Interactive Quiz System (QuizManager) =====
class QuizManager {
    constructor(containerId, questions) {
        this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        if (!this.container) return;
        
        this.questions = questions || [];
        this.currentQuestion = 0;
        this.answers = [];
        this.score = 0;
        this.isReviewMode = false;
        
        this.init();
    }
    
    init() {
        if (this.questions.length === 0) {
            this.container.innerHTML = '<p>No questions available for this unit yet.</p>';
            return;
        }
        this.renderQuestion();
    }
    
    renderQuestion() {
        const q = this.questions[this.currentQuestion];
        const answered = this.answers[this.currentQuestion] !== undefined;
        const progressPercent = Math.round(((this.currentQuestion + 1) / this.questions.length) * 100);
        
        let html = `
            <div class="quiz-header">
                <h3><i class="fas fa-award"></i> Unit Assessment Quiz</h3>
                <div class="quiz-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <span class="progress-text">${this.currentQuestion + 1} of ${this.questions.length}</span>
                </div>
            </div>
            
            <div class="question-card ${answered ? (this.answers[this.currentQuestion] === q.correct ? 'answered-correct' : 'answered-wrong') : ''}">
                <span class="question-number">Question ${this.currentQuestion + 1}</span>
                <p class="question-text">${q.question}</p>
                
                <div class="options-list">
                    ${q.options.map((opt, idx) => {
                        let classes = 'option-item';
                        let icon = '';
                        
                        if (answered) {
                            classes += ' disabled';
                            if (idx === q.correct) {
                                classes += ' correct';
                                icon = '<i class="fas fa-check-circle option-icon" style="color: #10b981;"></i>';
                            } else if (idx === this.answers[this.currentQuestion] && idx !== q.correct) {
                                classes += ' incorrect';
                                icon = '<i class="fas fa-times-circle option-icon" style="color: #ef4444;"></i>';
                            }
                        } else if (this.answers[this.currentQuestion] === idx) {
                            classes += ' selected';
                        }
                        
                        return `
                            <div class="${classes}" onclick="window.currentQuiz.selectOption(${idx})">
                                <span class="option-letter">${String.fromCharCode(65 + idx)}</span>
                                <span class="option-text">${opt}</span>
                                ${icon}
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="explanation ${answered ? 'show' : ''}">
                    <h5><i class="fas fa-lightbulb"></i> Conceptual Explanation</h5>
                    <p>${q.explanation || 'Review the unit notes above for further technical context.'}</p>
                </div>
            </div>
            
            <div class="quiz-navigation">
                <button class="quiz-btn prev-btn" onclick="window.currentQuiz.prevQuestion()" ${this.currentQuestion === 0 ? 'disabled' : ''}>
                    <i class="fas fa-arrow-left"></i> Previous
                </button>
                
                ${this.currentQuestion === this.questions.length - 1 ? 
                    `<button class="quiz-btn submit-btn" onclick="window.currentQuiz.showResults()">
                        <i class="fas fa-chart-bar"></i> View Results
                    </button>` :
                    `<button class="quiz-btn next-btn" onclick="window.currentQuiz.nextQuestion()">
                        Next <i class="fas fa-arrow-right"></i>
                    </button>`
                }
            </div>
        `;
        
        this.container.innerHTML = html;
    }
    
    selectOption(index) {
        if (this.answers[this.currentQuestion] !== undefined) return;
        
        this.answers[this.currentQuestion] = index;
        if (index === this.questions[this.currentQuestion].correct) {
            this.score++;
        }
        this.renderQuestion();
    }
    
    nextQuestion() {
        if (this.currentQuestion < this.questions.length - 1) {
            this.currentQuestion++;
            this.renderQuestion();
        }
    }
    
    prevQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.renderQuestion();
        }
    }
    
    showResults() {
        const percentage = Math.round((this.score / this.questions.length) * 100);
        let icon, iconClass, message;
        
        if (percentage >= 90) {
            icon = 'fa-trophy';
            iconClass = 'excellent';
            message = 'Outstanding Mastery! You have mastered this unit for university & GATE exams!';
        } else if (percentage >= 70) {
            icon = 'fa-medal';
            iconClass = 'good';
            message = 'Great Performance! Solid conceptual grasp with minor areas for review.';
        } else if (percentage >= 50) {
            icon = 'fa-thumbs-up';
            iconClass = 'average';
            message = 'Good Foundation! Review key formulas, algorithms, and retry.';
        } else {
            icon = 'fa-book-reader';
            iconClass = 'poor';
            message = 'Keep Learning! Revisit the topic notes in this guide and attempt again.';
        }
        
        // Trigger celebratory confetti on high scores
        if (percentage >= 80) {
            ConfettiEffect.trigger();
        }
        
        this.container.innerHTML = `
            <div class="quiz-results">
                <div class="results-icon ${iconClass}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="results-score">${percentage}%</div>
                <p class="results-message">${message}</p>
                
                <div class="results-details">
                    <div class="result-stat correct">
                        <div class="number">${this.score}</div>
                        <div class="label">Correct Answers</div>
                    </div>
                    <div class="result-stat incorrect">
                        <div class="number">${this.questions.length - this.score}</div>
                        <div class="label">Incorrect / Missed</div>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
                    <button class="retry-btn" onclick="window.currentQuiz.restart()">
                        <i class="fas fa-redo"></i> Retake Quiz
                    </button>
                    <button class="review-btn" onclick="window.currentQuiz.reviewAnswers()">
                        <i class="fas fa-eye"></i> Review Solutions
                    </button>
                </div>
            </div>
        `;
    }
    
    restart() {
        this.currentQuestion = 0;
        this.answers = [];
        this.score = 0;
        this.isReviewMode = false;
        this.renderQuestion();
    }
    
    reviewAnswers() {
        this.isReviewMode = true;
        this.currentQuestion = 0;
        this.renderQuestion();
    }
}

// Global quiz instance reference
window.QuizManager = QuizManager;
window.currentQuiz = null;

// ===== 13. Cheatsheet Search =====
const CheatsheetSearch = {
    init() {
        const searchInput = document.getElementById('cheatsheetSearch');
        if (!searchInput) return;
        
        const cards = document.querySelectorAll('.cheat-card');
        
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            let matches = 0;
            
            cards.forEach(card => {
                const keywords = card.dataset.keywords || '';
                const headerText = card.querySelector('.cheat-card-header')?.textContent || '';
                const bodyText = card.querySelector('.cheat-card-body')?.textContent || '';
                const content = `${keywords} ${headerText} ${bodyText}`.toLowerCase();
                
                if (searchTerm === '' || content.includes(searchTerm)) {
                    card.classList.remove('hidden');
                    matches++;
                } else {
                    card.classList.add('hidden');
                }
            });
            
            let noResultsMsg = document.querySelector('.no-results-msg');
            if (matches === 0 && searchTerm !== '') {
                if (!noResultsMsg) {
                    noResultsMsg = document.createElement('div');
                    noResultsMsg.className = 'no-results-msg';
                    noResultsMsg.style.cssText = 'text-align: center; padding: 50px 20px; grid-column: 1 / -1; color: var(--text-light);';
                    noResultsMsg.innerHTML = `
                        <i class="fas fa-search" style="font-size: 2.5rem; margin-bottom: 12px; color: #94a3b8;"></i>
                        <p style="font-size: 1.1rem; font-weight: 600;">No concepts found for "<strong>${searchTerm}</strong>"</p>
                        <p style="font-size: 0.9rem;">Try searching: SQL, Join, 3NF, BCNF, ACID, Lock, 2PL, Recovery</p>
                    `;
                    document.querySelector('.cheatsheet-grid')?.appendChild(noResultsMsg);
                }
            } else if (noResultsMsg) {
                noResultsMsg.remove();
            }
        });
        
        // Escape clears search
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
            }
        });
    }
};

// ===== Document Ready Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    PageTransition.init();
    initNavToggle();
    initScrollTop();
    initCopyCode();
    initSmoothScroll();
    initSidebarObserver();
    initScrollAnimations();
    CheatsheetSearch.init();
    
    // Trigger Prism code highlighting if library exists
    if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
    }
});

console.log('DBMS Learning Hub Engine Loaded Successfully!');
