mapboxgl.accessToken = mapToken;
const longitude = Number.parseFloat(geoMetryData.slice(0, geoMetryData.indexOf(',')));
const latitude = Number.parseFloat(geoMetryData.slice(geoMetryData.indexOf(',') + 1, geoMetryData.length));
const map = new mapboxgl.Map({
    container: 'map', // container ID
    // style: 'mapbox://styles/mapbox/streets-v11', // style URL
    style: 'mapbox://styles/mapbox/light-v10', // style URL
    center: [longitude, latitude], // starting position [lng, lat]
    zoom: 9 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl(),'bottom-left');

new mapboxgl.Marker()
    .setLngLat([longitude, latitude])
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${campgroundTitle}</h3><p>${campgroundLocation}</p>`
            )
    )
    .addTo(map);