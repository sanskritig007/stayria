/**
 * STAYRIA - SHOW PAGE ENHANCEMENTS CONTROLLER
 * Handles Fullscreen Lightbox Gallery, Share Modal, and Live Price Breakdown.
 */

document.addEventListener("DOMContentLoaded", () => {
  // ─────────────────────────────────────────────────────────────
  // 1. FULLSCREEN LIGHTBOX PHOTO GALLERY
  // ─────────────────────────────────────────────────────────────
  const lightboxModal = document.getElementById("lightbox-modal");
  const lightboxHeroImg = document.getElementById("lightbox-hero-img");
  const lightboxCounter = document.getElementById("lightbox-counter");
  const lightboxCloseBtn = document.getElementById("lightbox-close-btn");
  const lightboxPrevBtn = document.getElementById("lightbox-prev-btn");
  const lightboxNextBtn = document.getElementById("lightbox-next-btn");
  const lightboxThumbs = document.querySelectorAll(".lightbox-thumb");

  // Get gallery images from global window object or DOM
  const galleryImages = window.stayriaGalleryImages || [];
  let currentImageIdx = 0;

  function showLightboxSlide(index) {
    if (!galleryImages.length) return;
    if (index < 0) currentImageIdx = galleryImages.length - 1;
    else if (index >= galleryImages.length) currentImageIdx = 0;
    else currentImageIdx = index;

    // Cross-fade image
    if (lightboxHeroImg) {
      lightboxHeroImg.style.opacity = "0.5";
      lightboxHeroImg.src = galleryImages[currentImageIdx];
      lightboxHeroImg.onload = () => {
        lightboxHeroImg.style.opacity = "1";
      };
    }

    // Update Counter
    if (lightboxCounter) {
      lightboxCounter.textContent = `${currentImageIdx + 1} / ${galleryImages.length}`;
    }

    // Update Thumbnails
    lightboxThumbs.forEach((thumb, i) => {
      thumb.classList.toggle("active", i === currentImageIdx);
    });
  }

  function openLightbox(startIndex = 0) {
    if (!lightboxModal || !galleryImages.length) return;
    currentImageIdx = startIndex;
    showLightboxSlide(currentImageIdx);
    lightboxModal.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent background scroll
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove("active");
    document.body.style.overflow = "";
  }

  // Trigger Lightbox on Photo Clicks
  const photoTriggers = document.querySelectorAll(".photo-grid img, .photo-single-wrap img, .show-all-photos-btn");
  photoTriggers.forEach((trigger, idx) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      // If "Show all photos" button clicked, start from 0
      const startIdx = trigger.classList.contains("show-all-photos-btn") ? 0 : Math.min(idx, galleryImages.length - 1);
      openLightbox(startIdx);
    });
  });

  // Lightbox Close & Navigation
  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener("click", closeLightbox);
  if (lightboxPrevBtn) lightboxPrevBtn.addEventListener("click", () => showLightboxSlide(currentImageIdx - 1));
  if (lightboxNextBtn) lightboxNextBtn.addEventListener("click", () => showLightboxSlide(currentImageIdx + 1));

  // Thumbnail Clicks
  lightboxThumbs.forEach((thumb, i) => {
    thumb.addEventListener("click", () => showLightboxSlide(i));
  });

  // Keyboard navigation for Lightbox
  document.addEventListener("keydown", (e) => {
    if (!lightboxModal || !lightboxModal.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") showLightboxSlide(currentImageIdx - 1);
    else if (e.key === "ArrowRight") showLightboxSlide(currentImageIdx + 1);
  });

  // ─────────────────────────────────────────────────────────────
  // 2. SHARE PROPERTY MODAL
  // ─────────────────────────────────────────────────────────────
  const shareModal = document.getElementById("share-modal");
  const openShareBtns = document.querySelectorAll(".open-share-modal-btn");
  const closeShareBtn = document.getElementById("close-share-modal-btn");
  const copyLinkBtn = document.getElementById("share-copy-btn");
  const shareUrlInput = document.getElementById("share-url-input");
  const shareToast = document.getElementById("share-toast");

  // Populate share URL input
  if (shareUrlInput) {
    shareUrlInput.value = window.location.href;
  }

  function openShare() {
    if (!shareModal) return;
    shareModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeShare() {
    if (!shareModal) return;
    shareModal.classList.remove("active");
    document.body.style.overflow = "";
  }

  openShareBtns.forEach(btn => btn.addEventListener("click", (e) => {
    e.preventDefault();
    openShare();
  }));

  if (closeShareBtn) closeShareBtn.addEventListener("click", closeShare);

  if (shareModal) {
    shareModal.addEventListener("click", (e) => {
      if (e.target === shareModal) closeShare();
    });
  }

  // Copy Link functionality
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener("click", () => {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        showToast("Link copied to clipboard!");
        copyLinkBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        setTimeout(() => {
          copyLinkBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy Link';
        }, 2000);
      }).catch(() => {
        if (shareUrlInput) {
          shareUrlInput.select();
          document.execCommand("copy");
          showToast("Link copied to clipboard!");
        }
      });
    });
  }

  // Social Share Action Handlers
  const whatsappShareBtn = document.getElementById("share-whatsapp-btn");
  const twitterShareBtn = document.getElementById("share-twitter-btn");
  const nativeShareBtn = document.getElementById("share-native-btn");
  const pageTitle = document.title || "Check out this amazing stay on Stayria!";

  if (whatsappShareBtn) {
    whatsappShareBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const shareText = `Check out this stay on Stayria: ${pageTitle}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + window.location.href)}`, "_blank");
    });
  }

  if (twitterShareBtn) {
    twitterShareBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(pageTitle)}&url=${encodeURIComponent(window.location.href)}`, "_blank");
    });
  }

  if (nativeShareBtn) {
    nativeShareBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (navigator.share) {
        navigator.share({
          title: pageTitle,
          url: window.location.href,
        }).catch(() => {});
      } else {
        copyLinkBtn.click();
      }
    });
  }

  function showToast(msg) {
    if (!shareToast) return;
    shareToast.querySelector(".toast-text").textContent = msg;
    shareToast.classList.add("show");
    setTimeout(() => {
      shareToast.classList.remove("show");
    }, 2800);
  }
});
