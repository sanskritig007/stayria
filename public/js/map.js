document.addEventListener("DOMContentLoaded", () => {
  mapboxgl.accessToken = mapToken;

  const coordinates = window.mapCoordinates;
  if (!coordinates || coordinates.length !== 2) {
    console.error("Map coordinates missing for this listing");
    return;
  }

  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: coordinates,
    zoom: 10
  });

  new mapboxgl.Marker({color:"red"})
    .setLngLat(coordinates)
    .setPopup(
      new mapboxgl.Popup({offset:25})
     .setHTML(
      `<h4>${listingTitle}</h4><p>Exact Location will be provided after booking</p>`
     )
     )
    .addTo(map);

  setTimeout(() => {
    map.resize();
  });
});