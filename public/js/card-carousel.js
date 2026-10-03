/**
 * STAYRIA - CARD CAROUSEL & MULTI-ROW CONTROLLER
 * Handles in-card image sliding, category filter bar, and destination row horizontal scrolling.
 */

document.addEventListener("DOMContentLoaded", () => {
  // ─────────────────────────────────────────────────────────────
  // 1. IN-CARD IMAGE CAROUSEL LOGIC
  // ─────────────────────────────────────────────────────────────
  const carousels = document.querySelectorAll(".card-carousel-container");

  carousels.forEach((carousel) => {
    const track = carousel.querySelector(".card-carousel-track");
    const slides = carousel.querySelectorAll(".card-carousel-slide");
    const prevBtn = carousel.querySelector(".carousel-nav-btn.prev");
    const nextBtn = carousel.querySelector(".carousel-nav-btn.next");
    const dots = carousel.querySelectorAll(".carousel-dot");
    const totalSlides = slides.length;

    if (totalSlides <= 1) return; // Single image, no carousel needed

    let currentIndex = 0;

    function goToSlide(index) {
      if (index < 0) {
        currentIndex = totalSlides - 1;
      } else if (index >= totalSlides) {
        currentIndex = 0;
      } else {
        currentIndex = index;
      }

      // Slide track
      track.style.transform = `translateX(-${currentIndex * 100}%)`;

      // Update dots
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === currentIndex);
      });
    }

    // Previous Button
    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        goToSlide(currentIndex - 1);
      });
    }

    // Next Button
    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        goToSlide(currentIndex + 1);
      });
    }

    // Dot Clicks
    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        goToSlide(dotIndex);
      });
    });

    // Touch Swipe Support (Mobile)
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    carousel.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      },
      { passive: true }
    );

    function handleSwipe() {
      const swipeDistance = touchStartX - touchEndX;
      if (Math.abs(swipeDistance) > 40) {
        if (swipeDistance > 0) {
          goToSlide(currentIndex + 1);
        } else {
          goToSlide(currentIndex - 1);
        }
      }
    }
  });

  // ─────────────────────────────────────────────────────────────
  // 2. CATEGORY FILTER BAR HORIZONTAL SCROLL CONTROLS
  // ─────────────────────────────────────────────────────────────
  const filterScrollContainer = document.querySelector(".filters-scroll");
  const filterPrevBtn = document.getElementById("filter-prev-btn");
  const filterNextBtn = document.getElementById("filter-next-btn");

  if (filterScrollContainer && filterPrevBtn && filterNextBtn) {
    function updateScrollButtonsVisibility() {
      const scrollLeft = filterScrollContainer.scrollLeft;
      const maxScroll =
        filterScrollContainer.scrollWidth - filterScrollContainer.clientWidth;

      if (maxScroll <= 5) {
        filterPrevBtn.classList.add("hidden");
        filterNextBtn.classList.add("hidden");
        return;
      }

      // Hide or show prev button
      if (scrollLeft <= 5) {
        filterPrevBtn.classList.add("hidden");
      } else {
        filterPrevBtn.classList.remove("hidden");
      }

      // Hide or show next button
      if (scrollLeft >= maxScroll - 5) {
        filterNextBtn.classList.add("hidden");
      } else {
        filterNextBtn.classList.remove("hidden");
      }
    }

    const scrollAmount = 260;

    filterPrevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      filterScrollContainer.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    });

    filterNextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      filterScrollContainer.scrollBy({ left: scrollAmount, behavior: "smooth" });
    });

    filterScrollContainer.addEventListener("scroll", updateScrollButtonsVisibility);
    window.addEventListener("resize", updateScrollButtonsVisibility);

    setTimeout(updateScrollButtonsVisibility, 100);
  }

  // ─────────────────────────────────────────────────────────────
  // 3. DESTINATION MULTI-ROW TRACK SCROLL CONTROLS
  // ─────────────────────────────────────────────────────────────
  document.querySelectorAll(".row-nav-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute("data-target");
      const track = document.getElementById(targetId);
      if (!track) return;

      const scrollAmount = 600; // Scroll 2 cards at a time
      if (btn.classList.contains("prev-row-btn")) {
        track.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        track.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    });
  });
});
