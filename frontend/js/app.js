// ========================================
// Smart Campus Bus — Main Application
// ========================================

import { app, auth, db } from "./firebase-config.js";

// ── App Initialization ──
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚌 Smart Campus Bus App Initialized");

    // Initialize animations
    initCounterAnimation();
    initScrollAnimations();
    initHeaderScroll();
});

// ── Counter Animation (Hero Stats) ──
function initCounterAnimation() {
    const counters = document.querySelectorAll("[data-count]");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.getAttribute("data-count"), 10);
                    animateCounter(el, target);
                    observer.unobserve(el);
                }
            });
        },
        { threshold: 0.5 }
    );

    counters.forEach((counter) => observer.observe(counter));
}

function animateCounter(element, target) {
    const duration = 1500;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(easeOut * target);

        element.textContent = current.toLocaleString() + (target >= 100 ? "+" : "");

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// ── Scroll Reveal Animations ──
function initScrollAnimations() {
    const animateElements = document.querySelectorAll(
        ".feature-card, .step, .role-card"
    );

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Stagger the animation delay
                    setTimeout(() => {
                        entry.target.style.opacity = "1";
                        entry.target.style.transform = "translateY(0)";
                    }, index * 80);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    animateElements.forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
        el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        observer.observe(el);
    });
}

// ── Header Background on Scroll ──
function initHeaderScroll() {
    const header = document.getElementById("header");
    if (!header) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.style.background = "rgba(7, 7, 14, 0.95)";
            header.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.3)";
        } else {
            header.style.background = "rgba(7, 7, 14, 0.8)";
            header.style.boxShadow = "none";
        }
    });
}
