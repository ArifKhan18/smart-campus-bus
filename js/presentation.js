/* Smart Campus Bus Tracking System - Presentation Controller */

document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    let currentSlide = 0;
    let editMode = false;

    const progressBar = document.getElementById('progressBar');
    const slideCounter = document.getElementById('slideCounter');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    // Theme Management
    const themeSelect = document.getElementById('themeSelect');

    window.changeTheme = function(themeName) {
        document.body.classList.remove('theme-classic', 'theme-terracotta', 'theme-oceanic');
        document.body.classList.add(`theme-${themeName}`);
        localStorage.setItem('selected-theme', themeName);
        if (themeSelect && themeSelect.value !== themeName) {
            themeSelect.value = themeName;
        }
    };

    // Load saved theme or default to terracotta (Idea 1 style)
    const savedTheme = localStorage.getItem('selected-theme') || 'terracotta';
    changeTheme(savedTheme);

    function updateSlide() {
        slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev');
            if (index === currentSlide) {
                slide.classList.add('active');
            } else if (index < currentSlide) {
                slide.classList.add('prev');
            }
        });

        // Update counter
        slideCounter.textContent = `${currentSlide + 1} / ${totalSlides}`;

        // Update progress bar
        const progress = ((currentSlide + 1) / totalSlides) * 100;
        progressBar.style.width = `${progress}%`;

        // Update button states
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === totalSlides - 1;
    }

    window.nextSlide = function() {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            updateSlide();
        }
    };

    window.prevSlide = function() {
        if (currentSlide > 0) {
            currentSlide--;
            updateSlide();
        }
    };

    window.goToSlide = function(index) {
        if (index >= 0 && index < totalSlides) {
            currentSlide = index;
            updateSlide();
        }
    };

    window.toggleFullscreen = function() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    window.toggleEditMode = function() {
        editMode = !editMode;
        const container = document.querySelector('.presentation-container');
        const btn = document.getElementById('editToggle');
        
        if (editMode) {
            container.classList.add('edit-mode');
            btn.textContent = '✅ Done Editing';
            btn.style.background = '#10b981';
            btn.style.color = 'white';
            btn.style.borderColor = '#10b981';
            
            // Enable contenteditable on all editable elements
            document.querySelectorAll('[contenteditable]').forEach(el => {
                el.setAttribute('contenteditable', 'true');
            });
        } else {
            container.classList.remove('edit-mode');
            btn.textContent = '✏️ Edit Mode';
            btn.style.background = '';
            btn.style.color = '';
            btn.style.borderColor = '';
            
            // Disable contenteditable
            document.querySelectorAll('[contenteditable]').forEach(el => {
                el.setAttribute('contenteditable', 'false');
            });
        }
    };

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Don't navigate if editing text
        if (editMode && e.target.getAttribute('contenteditable') === 'true') {
            return;
        }

        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ':
                e.preventDefault();
                nextSlide();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                prevSlide();
                break;
            case 'Home':
                e.preventDefault();
                goToSlide(0);
                break;
            case 'End':
                e.preventDefault();
                goToSlide(totalSlides - 1);
                break;
            case 'e':
            case 'E':
                if (!e.ctrlKey && !e.metaKey) {
                    toggleEditMode();
                }
                break;
            case 'f':
            case 'F':
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    } else {
                        document.documentElement.requestFullscreen();
                    }
                }
                break;
        }
    });

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextSlide();
            else prevSlide();
        }
    }, { passive: true });

    // Initialize
    updateSlide();
    
    // Hide shortcuts hint after 10 seconds
    setTimeout(() => {
        const hint = document.getElementById('shortcutsHint');
        if (hint) hint.style.opacity = '0';
    }, 10000);
});
