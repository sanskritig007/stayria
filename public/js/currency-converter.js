/**
 * STAYRIA - MULTI-CURRENCY CONVERTER ENGINE
 * Live client-side conversion between INR (₹), USD ($), EUR (€), and GBP (£) with localStorage memory.
 */

const StayriaCurrency = (() => {
  const RATES = {
    INR: { rate: 1.0, symbol: "₹", locale: "en-IN" },
    USD: { rate: 0.012, symbol: "$", locale: "en-US" },
    EUR: { rate: 0.011, symbol: "€", locale: "de-DE" },
    GBP: { rate: 0.0095, symbol: "£", locale: "en-GB" },
  };

  let currentCurrency = localStorage.getItem("stayria_currency") || "INR";
  if (!RATES[currentCurrency]) currentCurrency = "INR";

  function getCurrency() {
    return currentCurrency;
  }

  function formatPrice(inrAmount, currency = currentCurrency) {
    const config = RATES[currency] || RATES.INR;
    const converted = Math.round(inrAmount * config.rate);
    return `${config.symbol}${converted.toLocaleString(config.locale)}`;
  }

  function setCurrency(currency) {
    if (!RATES[currency]) return;
    currentCurrency = currency;
    localStorage.setItem("stayria_currency", currency);

    // Update Dropdown Buttons Display
    document.querySelectorAll(".current-currency-label").forEach((el) => {
      el.textContent = `${RATES[currency].symbol} ${currency}`;
    });

    // Update Active Check in Dropdown Menu
    document.querySelectorAll(".currency-item").forEach((item) => {
      const isCur = item.getAttribute("data-currency") === currency;
      item.classList.toggle("active", isCur);
      const checkIcon = item.querySelector(".currency-check");
      if (checkIcon) checkIcon.style.display = isCur ? "inline-block" : "none";
    });

    // Update All Elements with [data-base-price]
    document.querySelectorAll("[data-base-price]").forEach((el) => {
      const baseInr = parseFloat(el.getAttribute("data-base-price"));
      if (!isNaN(baseInr)) {
        el.textContent = formatPrice(baseInr, currency);
      }
    });

    // If Show page updateBookingPrice exists, trigger it
    if (typeof window.updateBookingPrice === "function") {
      window.updateBookingPrice();
    }
  }

  function init() {
    setCurrency(currentCurrency);

    // Listen for currency dropdown selections
    document.querySelectorAll(".currency-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const selected = item.getAttribute("data-currency");
        if (selected) setCurrency(selected);
      });
    });
  }

  return {
    init,
    getCurrency,
    formatPrice,
    setCurrency,
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  StayriaCurrency.init();
});
