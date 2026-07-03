import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Phone,
  Globe,
  Search,
  Building2,
  Heart,
  LocateFixed,
} from "lucide-react";

// TODO(backend): this list is a starter set sourced from NACADA's (National
// Authority for the Campaign Against Alcohol and Drug Abuse) public
// accredited-rehab directories, spanning multiple counties/regions. Replace
// with a real endpoint once the backend exists, e.g.
//   getRehabCenters({ lat, lng, type, region, query }) -> GET /api/resources
// Coordinates below are town/area-level approximations (not exact building
// geocodes) — swap in precise lat/lng once each address is geocoded server-side.
const RESOURCES = [
  // Nairobi & Kiambu (Central)
  {
    id: 1,
    name: "The Retreat",
    type: "Residential",
    county: "Nairobi",
    region: "Nairobi & Central",
    address: "Off Oloolua Road, off Ngong–Kiserian Road, Nairobi",
    phone: "0734250490",
    website: null,
    lat: -1.3711,
    lng: 36.6564,
  },
  {
    id: 2,
    name: "Serene Rehab",
    type: "Residential",
    county: "Nairobi",
    region: "Nairobi & Central",
    address: "Miotoni Road, Karen, Nairobi",
    phone: "0746460202",
    website: "https://www.serenerehab.org",
    lat: -1.3197,
    lng: 36.7076,
  },
  {
    id: 3,
    name: "Life Bridge Cottage",
    type: "Residential",
    county: "Nairobi",
    region: "Nairobi & Central",
    address: "Northern Bypass, Marurui, Roysambu, Nairobi",
    phone: "0725133444",
    website: null,
    lat: -1.2103,
    lng: 36.8894,
  },
  {
    id: 4,
    name: "Silwan Fountain",
    type: "Counseling",
    county: "Nairobi",
    region: "Nairobi & Central",
    address: "Plateau Road, Roysambu, Mirema Drive, Nairobi",
    phone: "0745211263",
    website: "https://www.silwanfountain.org",
    lat: -1.2186,
    lng: 36.8886,
  },
  {
    id: 5,
    name: "Eden Village Treatment Centre",
    type: "Residential",
    county: "Kiambu",
    region: "Nairobi & Central",
    address: "King'eero, Lower Kabete–Wangige, Kiambu",
    phone: "0726051995",
    website: null,
    lat: -1.2126,
    lng: 36.7333,
  },
  {
    id: 6,
    name: "Phoenix Rehabilitation Centre",
    type: "Residential",
    county: "Kiambu",
    region: "Nairobi & Central",
    address: "Karai, Kikuyu, Kiambu",
    phone: "0720552512",
    website: "https://www.phoenixrehab.co.ke",
    lat: -1.2459,
    lng: 36.6628,
  },
  {
    id: 7,
    name: "Zen Recovery Treatment Center",
    type: "Outpatient",
    county: "Kiambu",
    region: "Nairobi & Central",
    address: "Kiamumbi, along Mshamba Road, Kiambu",
    phone: "0754150170",
    website: "https://www.zenrecoverytreatmentcenter.co.ke",
    lat: -1.1667,
    lng: 36.8333,
  },
  {
    id: 8,
    name: "Nuru Rehabilitation Centre",
    type: "Residential",
    county: "Kiambu",
    region: "Nairobi & Central",
    address: "Membley–Ridgeview Estate, Pine 6, Ruiru, Kiambu",
    phone: "0703810865",
    website: "https://www.nururehab.co.ke",
    lat: -1.146,
    lng: 36.963,
  },
  {
    id: 9,
    name: "Ambassadors Wellness Centre",
    type: "Outpatient",
    county: "Kiambu",
    region: "Nairobi & Central",
    address: "Mugutha, Juja, Kiambu",
    phone: "0794656710",
    website: "https://www.ambassadorswellnesscentre.com",
    lat: -1.1039,
    lng: 37.0138,
  },
  {
    id: 10,
    name: "Al-Mansur Rehabilitation Center",
    type: "Residential",
    county: "Kajiado",
    region: "Nairobi & Central",
    address: "Off Old Namanga Road, near Blessed Gilgal School, Kitengela",
    phone: "0726502053",
    website: "https://almansurrehabilitationcenter.co.ke",
    lat: -1.4748,
    lng: 36.9551,
  },

  // Rift Valley
  {
    id: 11,
    name: "Tripple Palm Rehabilitation and Recovery Centre",
    type: "Residential",
    county: "Nakuru",
    region: "Rift Valley",
    address: "Kiratina, Tuinuane Estate Phase One, off Kiamunyeki Road, Nakuru",
    phone: "0723168719",
    website: null,
    lat: -0.3031,
    lng: 36.08,
  },
  {
    id: 12,
    name: "Teen Challenge Kenya (Nakuru)",
    type: "Residential",
    county: "Nakuru",
    region: "Rift Valley",
    address: "Pipeline, Mzee wa Nyama Road, Nakuru",
    phone: "0713908708",
    website: null,
    lat: -0.2833,
    lng: 36.0667,
  },
  {
    id: 13,
    name: "Sobon Serenity",
    type: "Residential",
    county: "Baringo",
    region: "Rift Valley",
    address: "Along Eldama Ravine–Nakuru Road, Sollian Village",
    phone: "0726510898",
    website: "https://www.sobonserenity.org",
    lat: 0.0464,
    lng: 35.715,
  },
  {
    id: 14,
    name: "Oljabet Hospital",
    type: "Residential",
    county: "Nyandarua",
    region: "Rift Valley",
    address: "Along Nyahururu–Nakuru Highway, Nyahururu",
    phone: "0703333111",
    website: "https://www.oljabethospital.co.ke",
    lat: 0.0369,
    lng: 36.3667,
  },
  {
    id: 15,
    name: "St. Martin's Catholic Social Apostolate Rehab Centre",
    type: "Residential",
    county: "Nyandarua",
    region: "Rift Valley",
    address: "Nyahururu Town",
    phone: "0701266323",
    website: null,
    lat: 0.0372,
    lng: 36.3661,
  },
  {
    id: 16,
    name: "Lighthouse Healthcare",
    type: "Residential",
    county: "Uasin Gishu",
    region: "Rift Valley",
    address: "Elgon View Drive, off Testimony Schools, Eldoret",
    phone: "0735706069",
    website: "https://www.lighthousehealthcare.co.ke",
    lat: 0.5265,
    lng: 35.29,
  },
  {
    id: 17,
    name: "Jireh Faith-Based Rehab",
    type: "Residential",
    county: "Uasin Gishu",
    region: "Rift Valley",
    address: "Ya Mumbi, Kapseret Sub-County, Eldoret",
    phone: "0721224154",
    website: "https://www.jirehfaithbasedrehab.com",
    lat: 0.4667,
    lng: 35.2333,
  },
  {
    id: 18,
    name: "Morning Star Empowerment Foundation",
    type: "Outpatient",
    county: "Uasin Gishu",
    region: "Rift Valley",
    address: "Off Mosoriot–Kabiyet Road, Eldoret",
    phone: "0742935769",
    website: null,
    lat: 0.6167,
    lng: 35.3,
  },
  {
    id: 19,
    name: "Kap Kitale Rehab",
    type: "Residential",
    county: "Trans Nzoia",
    region: "Rift Valley",
    address: "Laini, along Kitale District Hospital Road, Kitale",
    phone: "0731477774",
    website: "https://www.kapkitale.com",
    lat: 1.0157,
    lng: 35.0062,
  },

  // Coast
  {
    id: 20,
    name: "Rima Serene Wellness",
    type: "Residential",
    county: "Mombasa",
    region: "Coast",
    address: "Barracks Lane, off Mt Kenya Road, Nyali, Mombasa",
    phone: "0777202010",
    website: "https://www.rimaserene.com",
    lat: -4.0272,
    lng: 39.7139,
  },
  {
    id: 21,
    name: "MEWA Rehabilitation Centre",
    type: "Residential",
    county: "Mombasa",
    region: "Coast",
    address: "Mtopanga, opposite Kisauni Post Office, old Malindi Road, Mombasa",
    phone: "0722819795",
    website: "https://www.mewa.or.ke",
    lat: -4.0058,
    lng: 39.6889,
  },
  {
    id: 22,
    name: "Reach Out Centre Trust",
    type: "Residential",
    county: "Mombasa",
    region: "Coast",
    address: "Junction Corner, off Mtongwe, Likoni, Mombasa",
    phone: "0722415475",
    website: "https://www.reachout.or.ke",
    lat: -4.0847,
    lng: 39.6486,
  },
  {
    id: 23,
    name: "Jocham Hospital Rehab",
    type: "Residential",
    county: "Mombasa",
    region: "Coast",
    address: "Kengeleni, Kisauni, along Mombasa–Malindi Road",
    phone: "0733710073",
    website: "https://www.jocham.org",
    lat: -4.0167,
    lng: 39.6833,
  },

  // Nyanza
  {
    id: 24,
    name: "Asumbi Treatment Centre",
    type: "Public",
    county: "Homa Bay",
    region: "Nyanza",
    address: "Kenya Lake Conference HQ of the Seventh-Day Adventist Church, Homa Bay (run by Caritas Homa Bay)",
    phone: "0723204677",
    website: null,
    lat: -0.55,
    lng: 34.4667,
  },

  // Eastern
  {
    id: 25,
    name: "Good Shepherd Rehabilitation",
    type: "Residential",
    county: "Makueni",
    region: "Eastern",
    address: "Ngumbe, Kibwezi, Makueni",
    phone: "0799466927",
    website: "https://www.goodshepherehabilitation.co.ke",
    lat: -2.4167,
    lng: 37.9667,
  },
  {
    id: 26,
    name: "Makueni County Treatment and Rehabilitation Program",
    type: "Public",
    county: "Makueni",
    region: "Eastern",
    address: "Wote Town, Makueni",
    phone: "0754833053",
    website: "https://www.makuenicounty.go.ke",
    lat: -1.7833,
    lng: 37.6167,
  },

  // North Eastern
  {
    id: 27,
    name: "NEP Rehabilitation Centre",
    type: "Residential",
    county: "Garissa",
    region: "North Eastern",
    address: "Garissa Town",
    phone: "0716631823",
    website: null,
    lat: -0.4569,
    lng: 39.6583,
  },
  {
    id: 28,
    name: "Mandera Wellness Centre",
    type: "Outpatient",
    county: "Mandera",
    region: "North Eastern",
    address: "Mandera Township",
    phone: "0757927114",
    website: "https://www.manderawellnesscentre.com",
    lat: 3.9366,
    lng: 41.867,
  },
];

const REGIONS = [
  "All",
  "Nairobi & Central",
  "Rift Valley",
  "Coast",
  "Nyanza",
  "Eastern",
  "North Eastern",
];

const TYPES = ["All", "Residential", "Outpatient", "Counseling", "Public"];

const TYPE_COLOR = {
  Residential: "#0d9488", // teal-600
  Outpatient: "#059669", // emerald-600
  Counseling: "#0891b2", // cyan-600
  Public: "#7c3aed", // violet-600
};

const TYPE_BADGE = {
  Residential: "bg-teal-50 text-teal-700 border-teal-100",
  Outpatient: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Counseling: "bg-cyan-50 text-cyan-700 border-cyan-100",
  Public: "bg-violet-50 text-violet-700 border-violet-100",
};

// Roughly the geographic center of Kenya — default view shows the whole country.
const KENYA_CENTER = [0.3, 37.8];
const KENYA_DEFAULT_ZOOM = 6;

// Haversine distance in km
function distanceKm(a, b) {
  if (!a || !b) return null;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

// Small colored pin, built as a divIcon so no external marker image assets
// are needed (avoids the classic Leaflet + Vite/webpack broken-icon issue).
function makePinIcon(color, isSelected) {
  const size = isSelected ? 34 : 26;
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:${size}px;height:${size}px;
        background:${color};
        border:2px solid white;
        border-radius:50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow:0 2px 6px rgba(0,0,0,0.35);
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

function makeUserIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:18px;height:18px;">
        <div style="
          position:absolute;inset:0;border-radius:9999px;
          background:rgba(13,148,136,0.25);
          animation:sh-pulse 1.6s ease-out infinite;
        "></div>
        <div style="
          position:absolute;inset:4px;border-radius:9999px;
          background:#0d9488;border:2px solid white;
          box-shadow:0 1px 4px rgba(0,0,0,0.4);
        "></div>
      </div>
      <style>
        @keyframes sh-pulse {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      </style>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

// Imperatively re-centers the map when `position` changes, since
// MapContainer only reads its `center` prop on first mount.
function FlyTo({ position, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, zoom ?? map.getZoom(), { duration: 0.8 });
  }, [position, zoom, map]);
  return null;
}

export default function Resources() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [flyTarget, setFlyTarget] = useState(null);
  // null = "All of Kenya" (no radius cap). Set to a number once we have a
  // location, so "Centers near me" actually narrows the results, not just
  // re-sorts all 28 of them.
  const [maxDistanceKm, setMaxDistanceKm] = useState(null);

  const markerRefs = useRef({});
  const listRefs = useRef({});

  const withDistance = useMemo(() => {
    return RESOURCES.map((r) => ({
      ...r,
      distanceKm: userLocation ? distanceKm(userLocation, r) : null,
    }));
  }, [userLocation]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = withDistance.filter((r) => {
      const matchType = typeFilter === "All" || r.type === typeFilter;
      const matchRegion = regionFilter === "All" || r.region === regionFilter;
      const matchDistance =
        !userLocation || maxDistanceKm == null || r.distanceKm <= maxDistanceKm;
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        r.county.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q);
      return matchType && matchRegion && matchDistance && matchSearch;
    });
    if (userLocation) {
      list = [...list].sort((a, b) => a.distanceKm - b.distanceKm);
    }
    return list;
  }, [withDistance, search, typeFilter, regionFilter, userLocation, maxDistanceKm]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Location isn't supported in this browser.");
      return;
    }
    // Geolocation is blocked by browsers on non-HTTPS origins (localhost is
    // exempt). This is the #1 reason "Centers near me" silently fails in dev
    // when the app is opened over plain http:// on a phone or LAN IP.
    if (!window.isSecureContext) {
      setLocationError(
        "Your browser is blocking location because this page isn't served over HTTPS. Try https:// or localhost."
      );
      return;
    }

    setLocating(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setMaxDistanceKm(100); // default to "within 100 km" once located
        setFlyTarget({ position: [loc.lat, loc.lng], zoom: 9 });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError(
            "Location access was denied. Check your browser's site settings and allow location for this page, then try again."
          );
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError("Your location couldn't be determined right now. Please try again.");
        } else if (err.code === err.TIMEOUT) {
          setLocationError("Finding your location took too long. Please try again.");
        } else {
          setLocationError("Couldn't get your location. You can still browse the list below.");
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  const handleClearLocation = () => {
    setUserLocation(null);
    setMaxDistanceKm(null);
    setLocationError("");
    setFlyTarget({ position: KENYA_CENTER, zoom: KENYA_DEFAULT_ZOOM });
  };

  const handleSelect = (r) => {
    setSelected(r.id);
    setFlyTarget({ position: [r.lat, r.lng], zoom: 12 });
    const marker = markerRefs.current[r.id];
    if (marker) marker.openPopup();
    listRefs.current[r.id]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recovery Resource Map</h1>
        <p className="text-gray-500 text-sm mt-1">
          Rehabilitation centers, counseling services, and outpatient programs from across Kenya.
        </p>
      </div>

      {/* Search + filters + locate */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, county, or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700
              focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
          />
        </div>

        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white
            focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r === "All" ? "All regions" : r}
            </option>
          ))}
        </select>

        <div className="flex gap-2 flex-wrap">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer
                ${
                  typeFilter === t
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-white border-gray-200 text-gray-500 hover:border-teal-300"
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {userLocation && (
          <select
            value={maxDistanceKm ?? "all"}
            onChange={(e) =>
              setMaxDistanceKm(e.target.value === "all" ? null : Number(e.target.value))
            }
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white
              focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
          >
            <option value="25">Within 25 km</option>
            <option value="50">Within 50 km</option>
            <option value="100">Within 100 km</option>
            <option value="250">Within 250 km</option>
            <option value="all">All of Kenya</option>
          </select>
        )}

        <button
          onClick={handleUseMyLocation}
          disabled={locating}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white bg-teal-600
            hover:bg-teal-500 active:scale-[0.98] transition-all duration-150 cursor-pointer
            disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <LocateFixed className="w-4 h-4" />
          {locating ? "Locating…" : userLocation ? "Update my location" : "Centers near me"}
        </button>

        {userLocation && (
          <button
            onClick={handleClearLocation}
            className="px-3 py-2 rounded-lg text-sm font-medium text-gray-500 bg-gray-100
              hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {locationError && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
          {locationError}
        </p>
      )}

      {userLocation && !locationError && (
        <p className="text-sm text-teal-700 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
          Showing centers {maxDistanceKm ? `within ${maxDistanceKm} km of` : "sorted by distance from"} your location.
        </p>
      )}

      {/* Map + list layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Map */}
        <div className="lg:col-span-3">
          <div className="h-[460px] rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <MapContainer
              center={KENYA_CENTER}
              zoom={KENYA_DEFAULT_ZOOM}
              scrollWheelZoom
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {flyTarget && <FlyTo position={flyTarget.position} zoom={flyTarget.zoom} />}

              {userLocation && (
                <Marker
                  position={[userLocation.lat, userLocation.lng]}
                  icon={makeUserIcon()}
                >
                  <Popup>You are here</Popup>
                </Marker>
              )}

              {filtered.map((r) => (
                <Marker
                  key={r.id}
                  position={[r.lat, r.lng]}
                  icon={makePinIcon(TYPE_COLOR[r.type] ?? "#0d9488", selected === r.id)}
                  eventHandlers={{ click: () => handleSelect(r) }}
                  ref={(el) => {
                    if (el) markerRefs.current[r.id] = el;
                  }}
                >
                  <Popup>
                    <div className="text-sm space-y-1 min-w-[180px]">
                      <p className="font-semibold text-gray-900">{r.name}</p>
                      <p className="text-gray-500 text-xs">{r.address}</p>
                      <p className="text-gray-400 text-xs">{r.county} County</p>
                      {r.distanceKm !== null && (
                        <p className="text-teal-700 text-xs font-medium">
                          {r.distanceKm.toFixed(0)} km away
                        </p>
                      )}
                      <div className="flex gap-2 pt-1">
                        <a
                          href={`tel:${r.phone}`}
                          className="text-xs font-medium text-teal-700 underline"
                        >
                          Call
                        </a>
                        {r.website && (
                          <a
                            href={r.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-teal-700 underline"
                          >
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-3 px-1">
            {Object.entries(TYPE_COLOR).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ background: color }}
                />
                <span className="text-xs text-gray-500">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
          <p className="text-xs text-gray-500">{filtered.length} resources found</p>

          {filtered.map((r) => (
            <div key={r.id} ref={(el) => (listRefs.current[r.id] = el)}>
              <button
                onClick={() => handleSelect(r)}
                className={`w-full text-left bg-white rounded-2xl border shadow-sm p-4 transition-colors cursor-pointer
                  ${selected === r.id ? "border-teal-300 bg-teal-50/40" : "border-gray-100 hover:border-teal-200"}`}
              >
                <div className="flex items-start gap-2 mb-1.5">
                  <div
                    className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5"
                    style={{ background: TYPE_COLOR[r.type] ?? "#0d9488" }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{r.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{r.county} County · {r.region}</p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full border ${TYPE_BADGE[r.type]}`}>
                        {r.type}
                      </span>
                      {r.distanceKm !== null && (
                        <span className="text-xs text-gray-500">{r.distanceKm.toFixed(0)} km</span>
                      )}
                    </div>
                  </div>
                </div>

                {selected === r.id && (
                  <div className="space-y-1.5 pt-2 border-t border-gray-100 mt-2">
                    <div className="flex items-start gap-1.5 text-xs text-gray-500">
                      <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" /> {r.address}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Building2 className="w-3 h-3 flex-shrink-0" /> {r.type}
                    </div>
                    <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                      <a href={`tel:${r.phone}`} className="flex-1">
                        <span className="flex items-center justify-center gap-1 h-8 rounded-lg text-xs font-medium text-white bg-teal-600 hover:bg-teal-500 transition-colors cursor-pointer">
                          <Phone className="w-3 h-3" /> {r.phone}
                        </span>
                      </a>
                      {r.website && (
                        <a href={r.website} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <span className="flex items-center justify-center gap-1 h-8 rounded-lg text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors cursor-pointer">
                            <Globe className="w-3 h-3" /> Website
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </button>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-sm text-gray-400 italic px-1 py-6 text-center space-y-2">
              <p>No resources match your search.</p>
              {userLocation && maxDistanceKm && (
                <button
                  onClick={() => setMaxDistanceKm(null)}
                  className="text-teal-600 not-italic font-medium underline cursor-pointer"
                >
                  Try showing all of Kenya instead
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* National helpline callout */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-4 flex-wrap">
        <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
          <Heart className="w-5 h-5 text-rose-500" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <p className="font-semibold text-rose-800 text-sm">NACADA National Helpline</p>
          <p className="text-xs text-rose-600">
            Free, confidential, 24/7 counseling and referrals — call 1192 via Safaricom or Telkom.
          </p>
        </div>
        <a href="tel:1192">
          <span className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer">
            <Phone className="w-3.5 h-3.5" /> Call 1192
          </span>
        </a>
      </div>
    </div>
  );
}