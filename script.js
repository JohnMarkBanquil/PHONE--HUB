
// Use real product photos when available and keep the CSS phone art as a fallback.
document.querySelectorAll(".product-photo").forEach((image) => {
    const fallback = image.nextElementSibling;
    const status = image.closest("article").querySelector("[data-image-status]");

    function showPhoto() {
        image.hidden = false;
        image.classList.add("is-loaded");
        fallback.hidden = true;
    }

    function showFallback() {
        image.hidden = true;
        image.classList.remove("is-loaded");
        fallback.hidden = false;
    }

    image.addEventListener("load", showPhoto);
    image.addEventListener("error", showFallback);

    try {
        const savedImage = localStorage.getItem(
            `phoneHub.productImage.${image.dataset.productImage}`
        );
        if (savedImage) {
            image.src = savedImage;
        }
    } catch (error) {
        status.textContent = "Saved photos are unavailable in this browser.";
    }

    if (image.complete && image.naturalWidth > 0) {
        showPhoto();
    } else if (image.complete) {
        showFallback();
    }

    const picker = image.closest("article").querySelector("[data-image-input]");
    if (!picker) {
        throw new Error(`Missing image picker for ${image.dataset.productImage}.`);
    }

    picker.addEventListener("change", () => {
        const file = picker.files[0];
        picker.value = "";
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            status.textContent = "Please choose an image file.";
            return;
        }

        const reader = new FileReader();
        reader.addEventListener("load", () => {
            if (typeof reader.result !== "string") {
                status.textContent = "Could not read that image. Please try another.";
                return;
            }

            image.src = reader.result;
            try {
                localStorage.setItem(
                    `phoneHub.productImage.${image.dataset.productImage}`,
                    reader.result
                );
                status.textContent = "Photo updated and saved in this browser.";
            } catch (error) {
                status.textContent = "Photo updated, but could not be saved in this browser.";
            }
        });
        reader.addEventListener("error", () => {
            status.textContent = "Could not read that image. Please try another.";
        });
        reader.readAsDataURL(file);
    });
});

const heroPhones = document.getElementById("heroPhones");
const heroPhoto = heroPhones.querySelector(".hero-photo");

heroPhoto.addEventListener("load", () => {
    heroPhoto.classList.add("is-loaded");
    heroPhones.classList.add("has-custom-image");
});

heroPhoto.addEventListener("error", () => {
    heroPhoto.classList.remove("is-loaded");
    heroPhones.classList.remove("has-custom-image");
});

// Register GSAP's scroll animation plugin
gsap.registerPlugin(ScrollTrigger);


// ---- B1: DARK MODE TOGGLE ----
const themeToggle = document.getElementById("themeToggle");
const body = document.body;
const html = document.documentElement;

function updateThemeButton() {
    const isDark = !body.classList.contains("light-mode");

    html.classList.toggle("dark", isDark);

    themeToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
    themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
    );
}

themeToggle.addEventListener("click", () => {
    body.classList.toggle("light-mode");
    updateThemeButton();

    gsap.fromTo(
        themeToggle,
        { rotation: 0 },
        {
            rotation: 360,
            duration: 0.5,
            ease: "power2.inOut"
        }
    );
});

updateThemeButton();


// ---- D1 + D2: INTRO ANIMATION ----
const intro = gsap.timeline({
    paused: true,
    defaults: {
        duration: 0.6,
        ease: "power2.out"
        // power2.out makes elements slow down smoothly as they appear.
    }
});

intro
    .from("#heroText .text-fire", {
        opacity: 0,
        y: 15,
        duration: 0.4
        // A short fade introduces the orange heading.
    })
    .from("#heroText h1", {
        opacity: 0,
        y: 35,
        duration: 0.7
        // The heading moves upward and settles smoothly.
    }, "-=0.2")
    .from("#heroText > p.muted-text", {
        opacity: 0,
        y: 20
        // The description follows the heading.
    }, "-=0.3")
    .from("#heroText a", {
        opacity: 0,
        y: 15,
        stagger: 0.15
        // Stagger displays the buttons one after another.
    }, "-=0.25")
    .from("#heroPhones", {
        opacity: 0,
        y: 35,
        duration: 0.6
        // Animate the full hero visual, including a custom image if present.
    }, "-=0.4");

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    intro.progress(1).pause();
} else {
    intro.play();
}

// ---- D3: REPLAY INTRO BUTTON ----
const replayIntro = document.getElementById("replayIntro");

replayIntro.addEventListener("click", () => {
    intro.restart();
});


// ---- E1 + E2 + E3: SCROLL ANIMATIONS ----
const motionSettings = gsap.matchMedia();

motionSettings.add(
    {
        motionOK: "(prefers-reduced-motion: no-preference)",
        reduceMotion: "(prefers-reduced-motion: reduce)"
    },
    (context) => {
        const { motionOK, reduceMotion } = context.conditions;

        if (reduceMotion) {
            // Keep all content visible when reduced motion is preferred.
            gsap.set(".reveal", {
                clearProps: "all"
            });

            gsap.set("#progressBar", {
                scaleX: 0
            });

            return;
        }

        if (motionOK) {
            // Each .reveal element receives its own ScrollTrigger.
            gsap.utils.toArray(".reveal").forEach((element) => {
                gsap.from(element, {
                    opacity: 0,
                    y: 25,
                    duration: 0.6,
                    ease: "power2.out",
                    // Smooth easing keeps section entrances subtle.
                    scrollTrigger: {
                        trigger: element,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    }
                });
            });

            // Progress bar grows as the visitor scrolls down.
            gsap.to("#progressBar", {
                scaleX: 1,
                ease: "none",
                // Linear easing keeps the bar synchronized with scrolling.
                scrollTrigger: {
                    trigger: document.documentElement,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 0.2
                }
            });
        }
    }
);


// ---- CONTACT FORM ----
// Replace this example address with the shop's real email.
const shopEmail = "phonehub@example.com";

document.getElementById("contactForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("customerName").value.trim();
    const email = document.getElementById("customerEmail").value.trim();
    const message = document.getElementById("customerMessage").value.trim();

    const subject = encodeURIComponent("Phone Hub Customer Inquiry");
    const bodyText = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );

    window.location.href =
        `mailto:${shopEmail}?subject=${subject}&body=${bodyText}`;
});


// ---- FOOTER YEAR ----
document.getElementById("year").textContent = new Date().getFullYear();
