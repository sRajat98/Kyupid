var map = L.map("map").setView([12.892376523386842, 77.55945907921542], 13);
var popup = L.popup();
const draw = () => {
  L.tileLayer(
    "https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=Imedcs6mijbMtUkLDLpz",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "mapbox/streets-v11",
      tileSize: 512,
      zoomOffset: -1,
      accessToken: "your.mapbox.access.token",
    }
  ).addTo(map);

  getData();
};

const getData = () => {
  let allUserInfoByArea = {};
  fetch("https://kyupid-api.vercel.app/api/users?page=1&limit=10")
    .then((response) => response.json())
    .then((userData) => {
      userData.users.map((individualUser) => {
        if (allUserInfoByArea[individualUser.area_id]) {
          return (allUserInfoByArea[individualUser.area_id] = [
            ...allUserInfoByArea[individualUser.area_id],
            individualUser,
          ]);
        }
        return (allUserInfoByArea[individualUser.area_id] = [individualUser]);
      });
      fetch("https://kyupid-api.vercel.app/api/areas")
        .then((response) => response.json())
        .then((data) => {
          L.geoJSON(data, {
            style: (feature) => style(feature, allUserInfoByArea),
            onEachFeature: (feature, layer) =>
              onEachFeature(feature, layer, allUserInfoByArea),
          }).addTo(map);
        });
    });
};

const style = (feature, allUsers) => {
  return {
    fillColor: getAreaColorCode(allUsers[feature.properties.area_id].length),
    weight: 2,
    opacity: 1,
    color: "#3449EA",
    fillOpacity: 0.7,
  };
};

const getAreaColorCode = (totalUsers) => {
  if (totalUsers <= 100) {
    return "#EF0808";
  }
  if (totalUsers > 100 && totalUsers <= 150) {
    return "#ff9100";
  }
  if (totalUsers > 150 && totalUsers <= 200) {
    return "#EEFF07";
  }
  if (totalUsers > 200) {
    return "#1BAA59";
  }
  return "#3449EA";
};

const onEachFeature = (feature, layer, allUserInfoByArea) => {
  const bounds = layer.getBounds();
  const center = bounds.getCenter();
  var text = L.tooltip({
    permanent: true,
    direction: "center",
    className: "text",
    borderRadius: "50%",
  })
    .setContent(allUserInfoByArea[feature.properties.area_id].length.toString())
    .setLatLng(center);
  text.addTo(map);

  layer.on({
    mouseover: (e) =>
      onMouseOver(e, allUserInfoByArea, feature.properties.area_id),
  });
};

const onMouseOver = (e, allUsers, areaId) => {
  const biferCatedUsers = filterUsers(allUsers, areaId);
  popup
    .setLatLng(e.latlng)
    .setContent(
      "Number of Users:" +
        allUsers[areaId].length.toString() +
        "<br />" +
        "Pro users: " +
        biferCatedUsers.proUsers.toString() +
        "<br />" +
        "Non Pro Users: " +
        biferCatedUsers.nonProUsers.toString() +
        "<br />" +
        "Female Users: " +
        biferCatedUsers.femaleUsers.toString() +
        "<br />" +
        "Male Users: " +
        biferCatedUsers.maleUsers.toString()
    )
    .openOn(map);
};

const filterUsers = (allUsers, areaId) => {
  let proUsers = 0;
  let nonProUsers = 0;
  let maleUsers = 0;
  let femaleUsers = 0;
  allUsers[areaId].map((individualUser) => {
    if (individualUser.gender === "M") maleUsers += 1;
    if (individualUser.gender === "F") femaleUsers += 1;
    if (individualUser.is_pro_user) {
      return (proUsers += 1);
    }
    return (nonProUsers += 1);
  });
  return { proUsers, nonProUsers, maleUsers, femaleUsers };
};
