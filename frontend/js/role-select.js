// ========================================
// Smart Campus Bus — Role Selection Page
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("🚌 Role Selection Page Loaded");

    initCardAnimations();
    initCardKeyboardNav();
});

// ── Staggered Card Entrance Animations ──
function initCardAnimations() {
    const cards = document.querySelectorAll(".role-select-card");

    cards.forEach((card, index) => {
        // Initial state for entrance animation
        card.style.opacity = "0";
        card.style.transform = "translateY(30px)";

        // Stagger the animation
        setTimeout(() => {
            card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }, 100 + index * 120);
    });
}

// ── Keyboard Navigation for Role Cards ──
function initCardKeyboardNav() {
    const cards = document.querySelectorAll(".role-select-card");

    cards.forEach((card) => {
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                card.click();
            }
        });
    });
}
