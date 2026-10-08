/**
 * STAYRIA - PHASE 3 INNOVATION FEATURES CONTROLLER
 * Handles Digital Boarding Pass with QR Codes, Map View Explore Mode, Contact Host, and AI Concierge.
 */

document.addEventListener("DOMContentLoaded", () => {
  // ─────────────────────────────────────────────────────────────
  // 1. DIGITAL BOARDING PASS & QR CODE GENERATOR (TRIPS PAGE)
  // ─────────────────────────────────────────────────────────────
  const staypassModal = document.getElementById("staypass-modal");
  const staypassCloseBtn = document.getElementById("staypass-close-btn");
  const staypassPrintBtn = document.getElementById("staypass-print-btn");

  function openStayPass(data) {
    if (!staypassModal) return;

    document.getElementById("staypass-guest-name").textContent = data.guest || "Guest";
    document.getElementById("staypass-property-title").textContent = data.title || "Stayria Stay";
    document.getElementById("staypass-dates").textContent = `${data.checkIn} → ${data.checkOut}`;
    document.getElementById("staypass-location").textContent = data.location || "Location";
    document.getElementById("staypass-guests-count").textContent = `${data.guests || 1} Guest(s)`;
    document.getElementById("staypass-total-paid").textContent = data.totalPrice || "";

    // Generate dynamic QR Code
    const qrImg = document.getElementById("staypass-qr-image");
    if (qrImg) {
      const qrData = `STAYRIA-PASS:${data.bookingId || "CONFIRMED"}|${data.title}|${data.checkIn}`;
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
    }

    staypassModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeStayPass() {
    if (!staypassModal) return;
    staypassModal.classList.remove("active");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".view-staypass-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const bookingData = {
        bookingId: btn.getAttribute("data-id"),
        title: btn.getAttribute("data-title"),
        location: btn.getAttribute("data-location"),
        checkIn: btn.getAttribute("data-checkin"),
        checkOut: btn.getAttribute("data-checkout"),
        guests: btn.getAttribute("data-guests"),
        totalPrice: btn.getAttribute("data-price"),
        guest: btn.getAttribute("data-guest"),
      };
      openStayPass(bookingData);
    });
  });

  if (staypassCloseBtn) staypassCloseBtn.addEventListener("click", closeStayPass);
  if (staypassPrintBtn) {
    staypassPrintBtn.addEventListener("click", () => {
      window.print();
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 2. INTERACTIVE MAP VIEW EXPLORE TOGGLE (HOMEPAGE)
  // ─────────────────────────────────────────────────────────────
  const mapToggleBtn = document.getElementById("floating-map-toggle-btn");
  const mapExploreContainer = document.getElementById("mapbox-explore-container");
  const listingsContentArea = document.getElementById("listings-content-area");
  let exploreMap = null;

  if (mapToggleBtn && mapExploreContainer) {
    mapToggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const isMapActive = mapExploreContainer.classList.contains("active");

      if (isMapActive) {
        // Switch back to List View
        mapExploreContainer.classList.remove("active");
        if (listingsContentArea) listingsContentArea.style.display = "block";
        mapToggleBtn.innerHTML = '<i class="fa-solid fa-map"></i> <span>Show map</span>';
      } else {
        // Switch to Map View
        if (listingsContentArea) listingsContentArea.style.display = "none";
        mapExploreContainer.classList.add("active");
        mapToggleBtn.innerHTML = '<i class="fa-solid fa-list"></i> <span>Show list</span>';

        initExploreMap();
      }
    });

    function initExploreMap() {
      if (exploreMap) {
        exploreMap.resize();
        return;
      }

      if (typeof mapboxgl === "undefined") return;

      mapboxgl.accessToken = window.mapToken || (typeof mapToken !== "undefined" ? mapToken : "");

      const listings = window.stayriaMapListings || [];
      const defaultCenter = listings.length > 0 && listings[0].coordinates ? listings[0].coordinates : [77.209, 28.6139];

      exploreMap = new mapboxgl.Map({
        container: "mapbox-explore-map",
        style: "mapbox://styles/mapbox/streets-v12",
        center: defaultCenter,
        zoom: 3,
      });

      exploreMap.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Add custom price markers
      listings.forEach((listing) => {
        if (!listing.coordinates || listing.coordinates.length < 2) return;

        const el = document.createElement("div");
        el.className = "map-price-marker";
        
        // Format price
        const formattedPrice = typeof StayriaCurrency !== "undefined"
          ? StayriaCurrency.formatPrice(listing.price)
          : `₹${listing.price.toLocaleString("en-IN")}`;
        el.textContent = formattedPrice;

        const popupHTML = `
          <a href="/listings/${listing.id}" class="map-popup-card">
            <img src="${listing.image}" class="map-popup-img" alt="${listing.title}">
            <div class="map-popup-body">
              <div class="map-popup-title">${listing.title}</div>
              <div class="map-popup-price">${formattedPrice} <span style="font-weight:400;color:#717171;">night</span></div>
            </div>
          </a>
        `;

        const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(popupHTML);

        new mapboxgl.Marker(el)
          .setLngLat(listing.coordinates)
          .setPopup(popup)
          .addTo(exploreMap);
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. CONTACT HOST MODAL (SHOW PAGE)
  // ─────────────────────────────────────────────────────────────
  const contactHostModal = document.getElementById("contact-host-modal");
  const openContactHostBtns = document.querySelectorAll(".open-contact-host-btn");
  const closeContactHostBtn = document.getElementById("close-contact-host-btn");
  const inquiryTextarea = document.getElementById("inquiry-message-text");
  const sendInquiryBtn = document.getElementById("send-inquiry-btn");

  if (openContactHostBtns.length > 0) {
    openContactHostBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (contactHostModal) {
          contactHostModal.classList.add("active");
          document.body.style.overflow = "hidden";
        }
      });
    });
  }

  if (closeContactHostBtn) {
    closeContactHostBtn.addEventListener("click", () => {
      if (contactHostModal) {
        contactHostModal.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  }

  // Quick chips click
  document.querySelectorAll(".inquiry-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      if (inquiryTextarea) {
        const question = chip.getAttribute("data-question");
        inquiryTextarea.value = (inquiryTextarea.value ? inquiryTextarea.value + " " : "") + question;
        inquiryTextarea.focus();
      }
    });
  });

  if (sendInquiryBtn) {
    sendInquiryBtn.addEventListener("click", () => {
      const msg = inquiryTextarea ? inquiryTextarea.value.trim() : "";
      if (!msg) {
        alert("Please enter a question for the host.");
        return;
      }
      // Send to host via WhatsApp or confirm
      const hostWhatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent("Hi! I have a question regarding this Stayria property: " + msg + " (" + window.location.href + ")")}`;
      window.open(hostWhatsappUrl, "_blank");
      if (contactHostModal) contactHostModal.classList.remove("active");
      document.body.style.overflow = "";
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 4. STAYRIA AI TRAVEL CONCIERGE WIDGET
  // ─────────────────────────────────────────────────────────────
  const aiFab = document.getElementById("ai-concierge-fab");
  const aiModal = document.getElementById("ai-concierge-modal");
  const closeAiBtn = document.getElementById("close-ai-modal-btn");

  if (aiFab && aiModal) {
    aiFab.addEventListener("click", () => {
      aiModal.classList.toggle("active");
    });

    if (closeAiBtn) {
      closeAiBtn.addEventListener("click", () => {
        aiModal.classList.remove("active");
      });
    }

    document.querySelectorAll(".ai-prompt-suggestion").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetQuery = btn.getAttribute("data-search");
        if (targetQuery) {
          window.location.href = `/listings?${targetQuery}`;
        }
      });
    });
  }
});
