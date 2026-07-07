import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
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
  Map as MapIcon,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  Wine,
  Pill,
  Brain,
  RefreshCcw,
  Users,
  Dices,
  Sparkles,
  Navigation,
  PlayCircle,
  Film,
  HeartHandshake,
  Clock,
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

  // Additional NACADA-accredited facilities (Nairobi & Central)
  {
    id: 29,
    name: "Comfort Care 360 Treatment and Rehabilitation Centre",
    type: "Residential",
    county: "Nairobi",
    region: "Nairobi & Central",
    address: "Lavington, Nairobi",
    phone: "0700705487",
    website: "https://www.comfortcareafrica.com",
    lat: -1.2833,
    lng: 36.7667,
  },
  {
    id: 30,
    name: "Rapid Rehabilitation Center",
    type: "Residential",
    county: "Nairobi",
    region: "Nairobi & Central",
    address: "Kahawa Sukari, Garissa Road, 2nd South Avenue, Nairobi",
    phone: "0727719023",
    website: "http://www.rapid.ics.ac.ke",
    lat: -1.1833,
    lng: 36.9333,
  },
  {
    id: 31,
    name: "Primrose Rehab and Wellness",
    type: "Residential",
    county: "Nairobi",
    region: "Nairobi & Central",
    address: "Karen, Nairobi",
    phone: "0723388238",
    website: null,
    lat: -1.3197,
    lng: 36.7076,
  },
  {
    id: 32,
    name: "Nairobi Place",
    type: "Residential",
    county: "Nairobi",
    region: "Nairobi & Central",
    address: "Mokoyeti Road, Karen, Nairobi",
    phone: null,
    website: null,
    lat: -1.3298,
    lng: 36.6976,
  },
  {
    id: 33,
    name: "The Retreat (Limuru)",
    type: "Residential",
    county: "Kiambu",
    region: "Nairobi & Central",
    address: "Mungai Close, St. Julian's Road, Ngecha Baraka Drive, Limuru",
    phone: null,
    website: null,
    lat: -1.1167,
    lng: 36.6833,
  },
  {
    id: 34,
    name: "Kizima Mental Wellness Foundation",
    type: "Outpatient",
    county: "Kiambu",
    region: "Nairobi & Central",
    address: "Marafique Arcade, Kenyatta Highway, Thika, Kiambu",
    phone: "0100985805",
    website: "https://kizimamentalwelnessfoundation.org",
    lat: -1.0333,
    lng: 37.0833,
  },
  {
    id: 35,
    name: "Tigoni Treatment Centre",
    type: "Residential",
    county: "Kiambu",
    region: "Nairobi & Central",
    address: "St George's Road, Tigoni, Limuru, Kiambu",
    phone: "0797777060",
    website: "https://www.tigonitreatment.com",
    lat: -1.1167,
    lng: 36.6833,
  },
  {
    id: 36,
    name: "The Serenity Place Counselling and Rehabilitation Centre",
    type: "Counseling",
    county: "Kiambu",
    region: "Nairobi & Central",
    address: "Mugumo, next to ACK Church, Kiu Kenda, Kiamumbi, Kiambu",
    phone: "0791200277",
    website: "https://www.diamondsrecovery.com",
    lat: -1.1892,
    lng: 36.8667,
  },
  {
    id: 37,
    name: "Promed Wellness",
    type: "Residential",
    county: "Kiambu",
    region: "Nairobi & Central",
    address: "Maporomoko Estate, Thika",
    phone: "0711887788",
    website: "https://www.promedwellness.co.ke",
    lat: -1.05,
    lng: 37.0833,
  },
  {
    id: 38,
    name: "Mediva Wellness",
    type: "Residential",
    county: "Kiambu",
    region: "Nairobi & Central",
    address: "Githingiri Estate, off Thika Highway, Thika",
    phone: "0711228904",
    website: "https://www.medivawellness.org",
    lat: -1.0167,
    lng: 37.0667,
  },
  {
    id: 39,
    name: "CAFRIC Rehabilitation Centre",
    type: "Residential",
    county: "Kiambu",
    region: "Nairobi & Central",
    address: "Githingiri Estate, Thika",
    phone: "0793888475",
    website: "https://www.cafric.org",
    lat: -1.0167,
    lng: 37.0667,
  },
  {
    id: 40,
    name: "Smart Life Wellness Centre",
    type: "Outpatient",
    county: "Kiambu",
    region: "Nairobi & Central",
    address: "Sewage, next to Lilies Hotel, Juja, Kiambu",
    phone: "0748142803",
    website: "https://www.smartlifewellnesscentre.co.ke",
    lat: -1.1039,
    lng: 37.0138,
  },
  {
    id: 41,
    name: "Dove International Rehabilitation Centre",
    type: "Residential",
    county: "Kiambu",
    region: "Nairobi & Central",
    address: "Karai, Kikuyu, Kiambu",
    phone: "0728512529",
    website: "https://www.doveinternational.co.ke",
    lat: -1.2459,
    lng: 36.6628,
  },
  {
    id: 42,
    name: "St. Martin Riverside Institute",
    type: "Residential",
    county: "Murang'a",
    region: "Nairobi & Central",
    address: "Mbirii-Muchungucha, Maragua, Murang'a",
    phone: "0712269356",
    website: "https://www.stmartinsrehab.co.ke",
    lat: -0.8333,
    lng: 37.1167,
  },
  {
    id: 43,
    name: "Daylight Rehabilitation Centre",
    type: "Residential",
    county: "Kajiado",
    region: "Nairobi & Central",
    address: "Green Castle, Ongata Rongai, Kajiado",
    phone: "0727215734",
    website: null,
    lat: -1.3959,
    lng: 36.7576,
  },

  // Additional facilities (Rift Valley)
  {
    id: 44,
    name: "Nyota Rehabilitation Centre",
    type: "Residential",
    county: "Uasin Gishu",
    region: "Rift Valley",
    address: "SOS Village Area, Kapsoya, Eldoret",
    phone: "0733303033",
    website: null,
    lat: 0.4988,
    lng: 35.2827,
  },
  {
    id: 45,
    name: "Akili Foundation",
    type: "Residential",
    county: "Nandi",
    region: "Rift Valley",
    address: "Itigo, Mosoriot Road, Nandi County",
    phone: "0738114749",
    website: "https://www.akilifoundation.org",
    lat: 0.1889,
    lng: 35.1425,
  },
  {
    id: 46,
    name: "Uasin Gishu County Alcohol and Drugs Treatment Centre",
    type: "Public",
    county: "Uasin Gishu",
    region: "Rift Valley",
    address: "Moiben Sub-County Hospital, Uasin Gishu",
    phone: "0705139880",
    website: null,
    lat: 0.6167,
    lng: 35.3833,
  },
  {
    id: 47,
    name: "Haven Recovery Centre",
    type: "Residential",
    county: "Uasin Gishu",
    region: "Rift Valley",
    address: "Along Kipkenyo–Elgeyo-Marakwet border road",
    phone: "0798694252",
    website: null,
    lat: 0.5333,
    lng: 35.3333,
  },
  {
    id: 48,
    name: "Moi Teaching and Referral Hospital — Alcohol and Drug Abuse Rehabilitation Unit",
    type: "Public",
    county: "Uasin Gishu",
    region: "Rift Valley",
    address: "Nandi Road, Eldoret",
    phone: "0726626391",
    website: null,
    lat: 0.5143,
    lng: 35.2698,
  },

  // Additional facilities (North Eastern)
  {
    id: 49,
    name: "Salamah Wellness Centre",
    type: "Outpatient",
    county: "Garissa",
    region: "North Eastern",
    address: "Bulhan, Garissa Town",
    phone: "0721988399",
    website: null,
    lat: -0.4569,
    lng: 39.6583,
  },

  // Additional NACADA-accredited facilities (Central — Nyeri & Kirinyaga)
  {
    id: 50,
    name: "Karatina Treatment & Recovery Center",
    type: "Residential",
    county: "Nyeri",
    region: "Nairobi & Central",
    address: "Along Karatina–Nyeri Highway, Karatina, Nyeri",
    phone: "0717170571",
    website: null,
    lat: -0.4833,
    lng: 37.1333,
  },
  {
    id: 51,
    name: "Safe Steps Recovery Centre",
    type: "Residential",
    county: "Nyeri",
    region: "Nairobi & Central",
    address: "Kiarithaini Village, Karatina, Mathira East, Nyeri",
    phone: "0708114872",
    website: "https://www.safestepsrecoverycentre.co.ke",
    lat: -0.4667,
    lng: 37.15,
  },
  {
    id: 52,
    name: "NACADA-Accredited Treatment Centre, Kimbimbi",
    type: "Public",
    county: "Kirinyaga",
    region: "Nairobi & Central",
    address: "Kimbimbi, Mwea, Kirinyaga County",
    phone: "0722332547",
    website: null,
    lat: -0.65,
    lng: 37.3667,
  },

  // Additional facilities (Eastern — Meru & Embu)
  {
    id: 53,
    name: "St. Nicholas Rehab & Nursing Home",
    type: "Residential",
    county: "Meru",
    region: "Eastern",
    address: "Kianjai, along Meru–Maua Road, Meru County",
    phone: "0715773374",
    website: "https://www.stnicholasriti.co.ke",
    lat: 0.1667,
    lng: 37.7833,
  },
  {
    id: 54,
    name: "Harmony Therapy Centre",
    type: "Outpatient",
    county: "Meru",
    region: "Eastern",
    address: "Kithinguri Market, Imanti South, Meru County",
    phone: "0706801911",
    website: null,
    lat: 0.05,
    lng: 37.75,
  },
  {
    id: 55,
    name: "St. Patrick Counselling and Treatment Centre",
    type: "Counseling",
    county: "Meru",
    region: "Eastern",
    address: "Maua, Maili Tatu Market, Igembe Central, Meru County",
    phone: "0757443805",
    website: null,
    lat: 0.2333,
    lng: 37.95,
  },
  {
    id: 56,
    name: "Cynerd Hospital and Rehabilitation Centre",
    type: "Residential",
    county: "Embu",
    region: "Eastern",
    address: "Mutunduri, along Embu–Meru Highway, Embu County",
    phone: null,
    website: "https://www.cynerdhospitalandrehab.org",
    lat: -0.42,
    lng: 37.52,
  },

  // Additional facilities (Nyanza — Kisumu & Kisii)
  {
    id: 57,
    name: "TINADA Rehabilitation Centre",
    type: "Residential",
    county: "Kisumu",
    region: "Nyanza",
    address: "Kisumu Town, Kisumu County",
    phone: "0724018799",
    website: null,
    lat: -0.1022,
    lng: 34.7617,
  },
  {
    id: 58,
    name: "Renaissance Rehabilitation Centre",
    type: "Residential",
    county: "Kisumu",
    region: "Nyanza",
    address: "Kisumu Town, Kisumu County",
    phone: "0722700710",
    website: null,
    lat: -0.0917,
    lng: 34.75,
  },
  {
    id: 59,
    name: "Jubilee Medical Center Rehabilitation Services",
    type: "Outpatient",
    county: "Kisumu",
    region: "Nyanza",
    address: "Kisumu Town, Kisumu County",
    phone: "0736600135",
    website: null,
    lat: -0.1,
    lng: 34.755,
  },
  {
    id: 60,
    name: "RAM Rehabilitation Centre",
    type: "Residential",
    county: "Kisii",
    region: "Nyanza",
    address: "Kisii Town, Kisii County",
    phone: "0714683334",
    website: null,
    lat: -0.6817,
    lng: 34.768,
  },
  {
    id: 61,
    name: "Jamii Rehabilitation Centre",
    type: "Residential",
    county: "Kisii",
    region: "Nyanza",
    address: "Kisii Town, Kisii County",
    phone: "0700144120",
    website: null,
    lat: -0.69,
    lng: 34.775,
  },

  // Additional facilities (Rift Valley — Kericho)
  {
    id: 62,
    name: "NACADA-Accredited Treatment Centre, Kericho",
    type: "Public",
    county: "Kericho",
    region: "Rift Valley",
    address: "Kericho Town, Kericho County",
    phone: "0700672099",
    website: null,
    lat: -0.3677,
    lng: 35.2831,
  },

  // Additional facilities (Western — Kakamega & Bungoma)
  {
    id: 63,
    name: "Goshen Drop-In Centre",
    type: "Outpatient",
    county: "Kakamega",
    region: "Western",
    address: "Kakamega Town, Kakamega County",
    phone: "0701884980",
    website: null,
    lat: 0.2827,
    lng: 34.7519,
  },
  {
    id: 64,
    name: "Promises Treatment Centre",
    type: "Residential",
    county: "Bungoma",
    region: "Western",
    address: "Mukhuyu, Webuye, Bungoma County",
    phone: "0725871040",
    website: null,
    lat: 0.6167,
    lng: 34.7667,
  },
  {
    id: 65,
    name: "Phoenix Recovery Center",
    type: "Residential",
    county: "Bungoma",
    region: "Western",
    address: "Bungoma Town, Bungoma County",
    phone: "0728839277",
    website: null,
    lat: 0.5667,
    lng: 34.5667,
  },

  // Additional facilities (Coast — Kilifi & Kwale)
  {
    id: 66,
    name: "MEWA Rehabilitation Centre (Kilifi Branch)",
    type: "Residential",
    county: "Kilifi",
    region: "Coast",
    address: "Charo wa Mae Road, Kilifi Town, Kilifi County",
    phone: "0722819795",
    website: "https://www.mewa.or.ke",
    lat: -3.6333,
    lng: 39.85,
  },
  {
    id: 67,
    name: "Reach Out Centre Trust (Kwale Branch)",
    type: "Residential",
    county: "Kwale",
    region: "Coast",
    address: "Matuga Sub-County, Kombani, Kwale County",
    phone: "0713630502",
    website: "https://www.reachout.or.ke",
    lat: -4.15,
    lng: 39.4833,
  },
  {
    id: 68,
    name: "Teens Watch Centre",
    type: "Counseling",
    county: "Kwale",
    region: "Coast",
    address: "Kwale Showground, Kwale County",
    phone: "0722927334",
    website: "https://www.teenswatchcentre.org",
    lat: -4.174,
    lng: 39.452,
  },

  // TODO(backend): the counties below have no NACADA-accredited private rehab
  // on record as of this writing — genuinely sparse in these areas, not a gap
  // in our data entry. Each pin instead routes to the official NACADA regional
  // office responsible for that county (source: NACADA "Where To Find Us"
  // directory), so someone can still call for a local referral. Swap these out
  // the moment a dedicated facility opens or gets accredited there.
  {
    id: 69,
    name: "NACADA South Rift Regional Office",
    type: "Public",
    county: "Machakos",
    region: "Eastern",
    address: "Regional Coordinators' Office, 2nd Floor, Room 5A, Nakuru — serves Machakos County",
    phone: null,
    website: null,
    lat: -1.5177,
    lng: 37.2634,
  },
  {
    id: 70,
    name: "NACADA Eastern Regional Office",
    type: "Public",
    county: "Kitui",
    region: "Eastern",
    address: "Regional Coordinators' Office, Ground Floor, Room 140, Embu — serves Kitui County",
    phone: "0723807460",
    website: null,
    lat: -1.3667,
    lng: 38.0167,
  },
  {
    id: 71,
    name: "NACADA Eastern Regional Office",
    type: "Public",
    county: "Tharaka-Nithi",
    region: "Eastern",
    address: "Regional Coordinators' Office, Ground Floor, Room 140, Embu — serves Tharaka-Nithi County",
    phone: "0723807460",
    website: null,
    lat: -0.3,
    lng: 37.9833,
  },
  {
    id: 72,
    name: "NACADA Eastern Regional Office",
    type: "Public",
    county: "Isiolo",
    region: "Eastern",
    address: "Regional Coordinators' Office, Ground Floor, Room 140, Embu — serves Isiolo County",
    phone: "0723807460",
    website: null,
    lat: 0.3546,
    lng: 37.5822,
  },
  {
    id: 73,
    name: "NACADA Eastern Regional Office",
    type: "Public",
    county: "Marsabit",
    region: "Eastern",
    address: "Regional Coordinators' Office, Ground Floor, Room 140, Embu — serves Marsabit County",
    phone: "0723807460",
    website: null,
    lat: 2.3284,
    lng: 37.9899,
  },
  {
    id: 74,
    name: "NACADA South Rift Regional Office",
    type: "Public",
    county: "Bomet",
    region: "Rift Valley",
    address: "Regional Coordinators' Office, 2nd Floor, Room 5A, Nakuru — serves Bomet County",
    phone: null,
    website: null,
    lat: -0.7833,
    lng: 35.3333,
  },
  {
    id: 75,
    name: "NACADA South Rift Regional Office",
    type: "Public",
    county: "Narok",
    region: "Rift Valley",
    address: "Regional Coordinators' Office, 2nd Floor, Room 5A, Nakuru — serves Narok County",
    phone: null,
    website: null,
    lat: -1.0833,
    lng: 35.8667,
  },
  {
    id: 76,
    name: "NACADA South Rift Regional Office",
    type: "Public",
    county: "Samburu",
    region: "Rift Valley",
    address: "Regional Coordinators' Office, 2nd Floor, Room 5A, Nakuru — serves Samburu County",
    phone: null,
    website: null,
    lat: 1.105,
    lng: 36.689,
  },
  {
    id: 77,
    name: "NACADA South Rift Regional Office",
    type: "Public",
    county: "Laikipia",
    region: "Rift Valley",
    address: "Regional Coordinators' Office, 2nd Floor, Room 5A, Nakuru — serves Laikipia County",
    phone: null,
    website: null,
    lat: 0.0333,
    lng: 36.9667,
  },
  {
    id: 78,
    name: "NACADA North Rift Regional Office",
    type: "Public",
    county: "Turkana",
    region: "Rift Valley",
    address: "KVDA Plaza, 12th Floor, Eldoret — serves Turkana County",
    phone: "0772079368",
    website: null,
    lat: 3.1167,
    lng: 35.6,
  },
  {
    id: 79,
    name: "NACADA North Rift Regional Office",
    type: "Public",
    county: "West Pokot",
    region: "Rift Valley",
    address: "KVDA Plaza, 12th Floor, Eldoret — serves West Pokot County",
    phone: "0772079368",
    website: null,
    lat: 1.6167,
    lng: 35.3833,
  },
  {
    id: 80,
    name: "NACADA North Rift Regional Office",
    type: "Public",
    county: "Elgeyo-Marakwet",
    region: "Rift Valley",
    address: "KVDA Plaza, 12th Floor, Eldoret — serves Elgeyo-Marakwet County",
    phone: "0772079368",
    website: null,
    lat: 0.75,
    lng: 35.4833,
  },
  {
    id: 81,
    name: "NACADA Western Regional Office",
    type: "Public",
    county: "Vihiga",
    region: "Western",
    address: "Regional Coordinators' Office, 1st Floor, Room 29 — serves Vihiga County",
    phone: "0720807754",
    website: null,
    lat: 0.0833,
    lng: 34.7167,
  },
  {
    id: 82,
    name: "NACADA Western Regional Office",
    type: "Public",
    county: "Busia",
    region: "Western",
    address: "Regional Coordinators' Office, 1st Floor, Room 29 — serves Busia County",
    phone: "0720807754",
    website: null,
    lat: 0.4608,
    lng: 34.1115,
  },
  {
    id: 83,
    name: "NACADA Nyanza Regional Office",
    type: "Public",
    county: "Siaya",
    region: "Nyanza",
    address: "Huduma Centre, Wing C, 1st Floor, Kisumu — serves Siaya County",
    phone: "0702112559",
    website: null,
    lat: 0.0607,
    lng: 34.2881,
  },
  {
    id: 84,
    name: "NACADA Nyanza Regional Office",
    type: "Public",
    county: "Migori",
    region: "Nyanza",
    address: "Huduma Centre, Wing C, 1st Floor, Kisumu — serves Migori County",
    phone: "0702112559",
    website: null,
    lat: -1.0634,
    lng: 34.4731,
  },
  {
    id: 85,
    name: "NACADA Nyanza Regional Office",
    type: "Public",
    county: "Nyamira",
    region: "Nyanza",
    address: "Huduma Centre, Wing C, 1st Floor, Kisumu — serves Nyamira County",
    phone: "0702112559",
    website: null,
    lat: -0.5633,
    lng: 34.9358,
  },
  {
    id: 86,
    name: "NACADA Coast Regional Office",
    type: "Public",
    county: "Taita-Taveta",
    region: "Coast",
    address: "NSSF House, Northern Wing, 9th Floor, Nkuruma Road, Mombasa — serves Taita-Taveta County",
    phone: "0702094901",
    website: null,
    lat: -3.3966,
    lng: 38.5586,
  },
  {
    id: 87,
    name: "NACADA Coast Regional Office",
    type: "Public",
    county: "Tana River",
    region: "Coast",
    address: "NSSF House, Northern Wing, 9th Floor, Nkuruma Road, Mombasa — serves Tana River County",
    phone: "0702094901",
    website: null,
    lat: -1.0167,
    lng: 40.1,
  },
  {
    id: 88,
    name: "NACADA Coast Regional Office",
    type: "Public",
    county: "Lamu",
    region: "Coast",
    address: "NSSF House, Northern Wing, 9th Floor, Nkuruma Road, Mombasa — serves Lamu County",
    phone: "0702094901",
    website: null,
    lat: -2.2717,
    lng: 40.902,
  },
  {
    id: 89,
    name: "NACADA North-Eastern Regional Office",
    type: "Public",
    county: "Wajir",
    region: "North Eastern",
    address: "Regional Coordinators' Office, Garissa — serves Wajir County",
    phone: "0720056605",
    website: null,
    lat: 1.7471,
    lng: 40.0629,
  },
];

const REGIONS = [
  "All",
  "Nairobi & Central",
  "Rift Valley",
  "Coast",
  "Nyanza",
  "Western",
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

// TODO(backend): the reading library below is a curated starter set of
// well-established, non-profit and public-health sources (not paid/affiliate
// links). Replace with a real endpoint once the backend exists, e.g.
//   getLibraryResources({ topic, query }) -> GET /api/library
// Each entry links out to the publisher's own site — Safe Haven does not
// host or reproduce their material. Verify links periodically, as
// organizations occasionally restructure their websites.
const LIBRARY_TOPICS = [
  {
    id: "alcohol",
    label: "Alcohol Use",
    Icon: Wine,
    color: "text-amber-600",
    bg: "bg-amber-50",
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    blurb: "For anyone working on cutting back or quitting drinking.",
    readings: [
      {
        title: "Alcohol Use Disorder: Symptoms & Causes",
        publisher: "Mayo Clinic",
        format: "Guide",
        desc: "A plain-language explanation of what alcohol use disorder is, how it develops, and the treatment approaches that are backed by research.",
        url: "https://www.mayoclinic.org/diseases-conditions/alcohol-use-disorder/symptoms-causes/syc-20369243",
      },
      {
        title: "Alcohol Fact Sheet",
        publisher: "World Health Organization (WHO)",
        format: "Fact sheet",
        desc: "Global health data on alcohol's effects on the body and society, useful for understanding the bigger picture behind personal recovery.",
        url: "https://www.who.int/news-room/fact-sheets/detail/alcohol",
      },
      {
        title: "Alcoholics Anonymous (\"The Big Book\")",
        publisher: "Alcoholics Anonymous World Services",
        format: "Book",
        desc: "The foundational 12-step recovery text, read by millions in AA fellowships worldwide, along with meeting-finder tools.",
        url: "https://www.aa.org/the-big-book",
      },
      {
        title: "NACADA National Helpline & Resources",
        publisher: "NACADA (Kenya)",
        format: "Directory",
        desc: "Kenya's own national authority on alcohol and drug abuse, offering counseling referrals and public education resources.",
        url: "https://nacada.go.ke",
      },
    ],
  },
  {
    id: "drugs",
    label: "Drugs & Substance Use",
    Icon: Pill,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    badge: "bg-cyan-50 text-cyan-700 border-cyan-100",
    blurb: "Science-based facts on drug use, dependence, and treatment.",
    readings: [
      {
        title: "Drug Addiction (Substance Use Disorder): Symptoms & Causes",
        publisher: "Mayo Clinic",
        format: "Guide",
        desc: "Explains what happens in the brain during addiction, why willpower alone often isn't enough, and what evidence-based treatment looks like.",
        url: "https://www.mayoclinic.org/diseases-conditions/drug-addiction/symptoms-causes/syc-20365112",
      },
      {
        title: "Drugs A–Z Reference Library",
        publisher: "FRANK",
        format: "Reference library",
        desc: "An accessible, regularly updated reference on specific substances, their effects, and risks — written for the general public.",
        url: "https://www.talktofrank.com/drugs-a-z",
      },
      {
        title: "Opioid Overdose Fact Sheet",
        publisher: "World Health Organization (WHO)",
        format: "Fact sheet",
        desc: "Life-saving information on recognizing an opioid overdose and how the antidote naloxone works — useful for people in recovery and their families alike.",
        url: "https://www.who.int/news-room/fact-sheets/detail/opioid-overdose",
      },
      {
        title: "Narcotics Anonymous",
        publisher: "NA World Services",
        format: "Fellowship & literature",
        desc: "A 12-step fellowship and literature catalog for recovery from any drug, with meetings held worldwide.",
        url: "https://www.na.org",
      },
    ],
  },
  {
    id: "mental-health",
    label: "Mental Health & Co-Occurring",
    Icon: Brain,
    color: "text-violet-600",
    bg: "bg-violet-50",
    badge: "bg-violet-50 text-violet-700 border-violet-100",
    blurb: "For when addiction overlaps with anxiety, depression, or other conditions.",
    readings: [
      {
        title: "Depression: Symptoms & Causes",
        publisher: "Mayo Clinic",
        format: "Guide",
        desc: "Covers symptoms, causes, and treatment options for depression, which commonly co-occurs with substance use.",
        url: "https://www.mayoclinic.org/diseases-conditions/depression/symptoms-causes/syc-20356007",
      },
      {
        title: "Understanding Mental Health Conditions",
        publisher: "NAMI — National Alliance on Mental Illness",
        format: "Guide & support directory",
        desc: "Accessible explanations of common conditions plus peer support programs for people managing mental health and recovery together.",
        url: "https://www.nami.org",
      },
      {
        title: "Information & Support",
        publisher: "Mind",
        format: "Guide & directory",
        desc: "A long-established mental health charity's plain-language guides on conditions, treatment options, and how to support someone else.",
        url: "https://www.mind.org.uk",
      },
    ],
  },
  {
    id: "relapse",
    label: "Relapse Prevention & Coping Skills",
    Icon: RefreshCcw,
    color: "text-teal-600",
    bg: "bg-teal-50",
    badge: "bg-teal-50 text-teal-700 border-teal-100",
    blurb: "Practical tools for staying steady through cravings and hard days.",
    readings: [
      {
        title: "Recovery Articles & Coping Tools",
        publisher: "Hazelden Betty Ford Foundation",
        format: "Article library",
        desc: "A large, regularly updated library of practical articles on relapse prevention, triggers, and staying grounded in early recovery.",
        url: "https://www.hazeldenbettyford.org/resources",
      },
      {
        title: "SMART Recovery",
        publisher: "SMART Recovery",
        format: "Program & tools",
        desc: "A secular, skills-based alternative or complement to 12-step programs, with self-management tools you can practice daily.",
        url: "https://www.smartrecovery.org",
      },
      {
        title: "Drug Addiction: Diagnosis & Treatment",
        publisher: "Mayo Clinic",
        format: "Guide",
        desc: "Covers what makes relapse more likely and what evidence-based treatment and ongoing support look like for long-term recovery.",
        url: "https://www.mayoclinic.org/diseases-conditions/drug-addiction/diagnosis-treatment/drc-20365113",
      },
    ],
  },
  {
    id: "family",
    label: "Family, Relationships & Codependency",
    Icon: Users,
    color: "text-rose-600",
    bg: "bg-rose-50",
    badge: "bg-rose-50 text-rose-700 border-rose-100",
    blurb: "Support for rebuilding trust and healthy relationships.",
    readings: [
      {
        title: "Al-Anon Family Groups",
        publisher: "Al-Anon Family Groups",
        format: "Fellowship & literature",
        desc: "Support and literature for people affected by a loved one's drinking, including a meeting finder for families and friends.",
        url: "https://al-anon.org",
      },
      {
        title: "Family Support Resources",
        publisher: "NAMI — National Alliance on Mental Illness",
        format: "Guide",
        desc: "Guidance for families navigating a loved one's mental health or co-occurring recovery journey, including how to set healthy boundaries.",
        url: "https://www.nami.org",
      },
      {
        title: "Books for Family & Loved Ones",
        publisher: "Hazelden Betty Ford Foundation",
        format: "Article & book library",
        desc: "Articles and reading recommendations specifically written for partners, parents, and children of someone in recovery.",
        url: "https://www.hazeldenbettyford.org/resources",
      },
    ],
  },
  {
    id: "gambling",
    label: "Gambling & Behavioral Addictions",
    Icon: Dices,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    blurb: "For compulsive gambling and other behavioral addictions.",
    readings: [
      {
        title: "National Council on Problem Gambling",
        publisher: "NCPG",
        format: "Directory & guide",
        desc: "Education on problem gambling plus a confidential helpline and treatment/peer-support directory, including for affected family members.",
        url: "https://www.ncpgambling.org",
      },
      {
        title: "Peer Support Resources",
        publisher: "NCPG",
        format: "Directory",
        desc: "An overview of Gamblers Anonymous, Gam-Anon, and SMART Recovery options for people struggling with gambling and their loved ones.",
        url: "https://www.ncpgambling.org/help-treatment/peer-support-resources/",
      },
      {
        title: "What Is Gambling Disorder?",
        publisher: "American Psychiatric Association",
        format: "Clinical overview",
        desc: "A clinician-reviewed explanation of gambling disorder as a recognized behavioral addiction, including warning signs and treatment paths.",
        url: "https://www.psychiatry.org/patients-families/gambling-disorder/what-is-gambling-disorder",
      },
    ],
  },
];

// Curated recovery videos for people who'd rather watch than read — talks,
// short documentaries, and guided practices from established, non-profit, or
// academic sources (TED, NIDA, UCLA, Al-Anon, Partnership to End Addiction).
// TODO(backend): move behind GET /api/video-library if this needs to be
// editable without a redeploy. Every card links out to the original
// publisher/host (mostly YouTube); Safe Haven doesn't host or re-upload any
// of this footage. Re-check links occasionally in case a video is removed.
const VIDEO_LIBRARY = [
  {
    id: "understanding",
    label: "Understanding Addiction",
    Icon: Brain,
    color: "text-violet-600",
    bg: "bg-violet-50",
    badge: "bg-violet-50 text-violet-700 border-violet-100",
    blurb: "The science and psychology behind why addiction happens.",
    videos: [
      {
        title: "Everything You Think You Know About Addiction Is Wrong",
        publisher: "Johann Hari · TED",
        format: "Talk",
        duration: "15 min",
        desc: "A journalist's global search for what really drives addiction, built around the famous \"Rat Park\" experiment and the idea that connection — not willpower — is the antidote.",
        url: "https://www.youtube.com/watch?v=PY9DcIMGxMs",
      },
      {
        title: "The Power of Addiction and the Addiction of Power",
        publisher: "Dr. Gabor Maté · TEDxRio+20",
        format: "Talk",
        duration: "19 min",
        desc: "A physician who has spent decades treating severe addiction explains how early pain and trauma — not the substance itself — usually sit at the root.",
        url: "https://www.youtube.com/watch?v=66cYcSak6nE",
      },
      {
        title: "What Is Addiction?",
        publisher: "National Institute on Drug Abuse (NIDA)",
        format: "Explainer",
        duration: "3 min",
        desc: "A short, clear animation on what happens in the brain during addiction, from the U.S. government's lead research agency on drug use.",
        url: "https://www.youtube.com/watch?v=FIdq9VveQMM",
      },
    ],
  },
  {
    id: "stories",
    label: "Real Recovery Stories",
    Icon: Heart,
    color: "text-rose-600",
    bg: "bg-rose-50",
    badge: "bg-rose-50 text-rose-700 border-rose-100",
    blurb: "First-hand accounts from people who've walked this road.",
    videos: [
      {
        title: "The Game Has Changed",
        publisher: "Chris Herren · TEDxUMassAmherst",
        format: "Talk",
        duration: "17 min",
        desc: "A former NBA player's honest account of addiction, rock bottom, and the long road back — now over 15 years into recovery.",
        url: "https://www.youtube.com/watch?v=gAZ9aL30qOI",
      },
      {
        title: "How Isolation Fuels Opioid Addiction",
        publisher: "Dr. Rachel Wurzman · TED",
        format: "Talk",
        duration: "18 min",
        desc: "A neuroscientist explains why loneliness is such a powerful driver of relapse — and why rebuilding community is one of the most protective things a person can do.",
        url: "https://www.youtube.com/watch?v=pxEcvU0Vp_M",
      },
      {
        title: "It Takes a Village to Recover From Drug Addiction",
        publisher: "Charlotte Colman · TEDxGhent",
        format: "Talk",
        duration: "13 min",
        desc: "A researcher challenges the \"once an addict, always an addict\" myth, showing how most people who use drugs do recover, gradually, with the right support around them.",
        url: "https://www.youtube.com/watch?v=GKTbAZCF4e0",
      },
    ],
  },
  {
    id: "skills",
    label: "Coping Skills & Mindfulness",
    Icon: Sparkles,
    color: "text-teal-600",
    bg: "bg-teal-50",
    badge: "bg-teal-50 text-teal-700 border-teal-100",
    blurb: "Practical tools for cravings, shame, and staying grounded.",
    videos: [
      {
        title: "A Simple Way to Break a Bad Habit",
        publisher: "Dr. Judson Brewer · TED",
        format: "Talk",
        duration: "9 min",
        desc: "A psychiatrist explains how getting curious about a craving — instead of fighting it — can loosen its grip, backed by his own mindfulness research.",
        url: "https://www.youtube.com/watch?v=-moW9jvvMr4",
      },
      {
        title: "The Power of Vulnerability",
        publisher: "Brené Brown · TEDxHouston",
        format: "Talk",
        duration: "20 min",
        desc: "One of the most-watched talks in the world, on shame, courage, and why letting yourself be seen is often the first step toward change.",
        url: "https://www.youtube.com/watch?v=iCvmsMzlF7o",
      },
      {
        title: "Free Guided Meditations",
        publisher: "UCLA Mindful",
        format: "Guided practice library",
        duration: "5–30 min each",
        desc: "A free library of studio-recorded guided meditations from UCLA's mindfulness center — useful for grounding, working with cravings, and settling before sleep.",
        url: "https://www.uclahealth.org/uclamindful/guided-meditations",
      },
    ],
  },
  {
    id: "family",
    label: "For Family & Friends",
    Icon: HeartHandshake,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    badge: "bg-cyan-50 text-cyan-700 border-cyan-100",
    blurb: "For the people who love someone in recovery.",
    videos: [
      {
        title: "Help and Hope for Families of Alcoholics",
        publisher: "Al-Anon Family Group Headquarters",
        format: "Explainer",
        duration: "3 min",
        desc: "A short, official introduction to Al-Anon's approach — recovery for the family, not just the person using — from the organization's own headquarters.",
        url: "https://www.youtube.com/watch?v=FnhK4-vF55g",
      },
      {
        title: "Recovering Together",
        publisher: "Partnership to End Addiction",
        format: "Video series",
        duration: "Multiple short episodes",
        desc: "Parents and family members who supported a loved one through substance use disorder share what helped, what didn't, and how they found hope.",
        url: "https://www.youtube.com/playlist?list=PLu1Vzpklw-4NHPrs2DNF_SPoQV0i9HMPP",
      },
    ],
  },
  {
    id: "kenya",
    label: "Kenya & Swahili Voices",
    Icon: MapPin,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    blurb: "Local news features and first-hand stories, in English and Kiswahili.",
    videos: [
      {
        title: "Dada Aliyekuwa Mraibu wa Mihadarati Aeleza Safari ya Kuacha Uraibu",
        publisher: "BBC News Swahili",
        format: "Ushuhuda (Testimony)",
        duration: "Habari fupi",
        desc: "Kwa Kiswahili. Mwanamke kutoka Mombasa anasimulia safari yake kutoka kwenye uraibu wa dawa za kulevya hadi kupona, pamoja na maoni ya daktari wa akili kuhusu uraibu.",
        url: "https://www.youtube.com/watch?v=sBskAfRtMzs",
      },
      {
        title: "Waraibu wa Madawa ya Kulevya Wakabiliwa na Changamoto za Kujinasua",
        publisher: "BBC News Swahili",
        format: "Ripoti (Report)",
        duration: "Habari fupi",
        desc: "Kwa Kiswahili. Ripoti kutoka Mombasa kuhusu vijana wanaotaka kuachana na uraibu wa mihadarati na upungufu wa dawa ya methadone wanaokabiliana nao.",
        url: "https://www.youtube.com/watch?v=B-JgYu4iRKk",
      },
      {
        title: "Rehabilitation in Kenya: The Challenge of Addiction and Rehabilitation",
        publisher: "KTN News Kenya",
        format: "News feature",
        duration: "Short feature",
        desc: "In English. A look at what treatment and rehabilitation actually looks like in Kenya today, including the gaps people run into on the way to recovery.",
        url: "https://www.youtube.com/watch?v=aeibLEGQND8",
      },
      {
        title: "Battling Drug Addiction: Struggle for Sobriety Amid Govt. Tough Talk",
        publisher: "NTV Kenya",
        format: "Special report",
        duration: "Short feature",
        desc: "In English, with Kiswahili interviews. NTV's special report from Kenya's Coast region on the realities of addiction, poverty, and the search for sobriety.",
        url: "https://ntvkenya.co.ke/newsfeatures/battling-drug-addiction-the-struggle-for-sobriety-amid-govt-tough-talk/",
      },
    ],
  },
];
const KENYA_CENTER = [0.3, 37.8];
const KENYA_DEFAULT_ZOOM = 6;

// Opens turn-by-turn directions in Google Maps. If we know the user's exact
// location we set it as the origin so Maps routes from where they actually
// are; otherwise Google Maps falls back to asking the visitor for their
// location itself.
function directionsUrl(dest, origin) {
  const destination = `${dest.lat},${dest.lng}`;
  const params = new URLSearchParams({
    api: "1",
    destination,
    travelmode: "driving",
  });
  if (origin) params.set("origin", `${origin.lat},${origin.lng}`);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

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
  const [activeSection, setActiveSection] = useState("centers"); // "centers" | "library" | "videos"
  const [libraryTopic, setLibraryTopic] = useState("All");
  const [librarySearch, setLibrarySearch] = useState("");
  const [videoTopic, setVideoTopic] = useState("All");
  const [videoSearch, setVideoSearch] = useState("");

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
  // re-sorts all of them.
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
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy, // meters — drawn as a Google-Maps-style radius
        };
        setUserLocation(loc);
        setMaxDistanceKm(100); // default to "within 100 km" once located
        // Zoom in close on the exact spot (like Google Maps' blue dot), not
        // just the wider region.
        setFlyTarget({ position: [loc.lat, loc.lng], zoom: 15 });
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

  const filteredLibrary = useMemo(() => {
    const q = librarySearch.trim().toLowerCase();
    return LIBRARY_TOPICS
      .filter((topic) => libraryTopic === "All" || topic.id === libraryTopic)
      .map((topic) => ({
        ...topic,
        readings: topic.readings.filter((r) => {
          if (!q) return true;
          return (
            r.title.toLowerCase().includes(q) ||
            r.publisher.toLowerCase().includes(q) ||
            r.desc.toLowerCase().includes(q)
          );
        }),
      }))
      .filter((topic) => topic.readings.length > 0);
  }, [libraryTopic, librarySearch]);

  const filteredVideos = useMemo(() => {
    const q = videoSearch.trim().toLowerCase();
    return VIDEO_LIBRARY
      .filter((topic) => videoTopic === "All" || topic.id === videoTopic)
      .map((topic) => ({
        ...topic,
        videos: topic.videos.filter((v) => {
          if (!q) return true;
          return (
            v.title.toLowerCase().includes(q) ||
            v.publisher.toLowerCase().includes(q) ||
            v.desc.toLowerCase().includes(q)
          );
        }),
      }))
      .filter((topic) => topic.videos.length > 0);
  }, [videoTopic, videoSearch]);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
        <p className="text-gray-500 text-sm mt-1">
          Find treatment centers near you, read trusted recovery literature, or watch curated
          videos — whichever fits how you like to learn.
        </p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveSection("centers")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer
            ${
              activeSection === "centers"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
        >
          <MapIcon className="w-4 h-4" /> Treatment Center Map
        </button>
        <button
          onClick={() => setActiveSection("library")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer
            ${
              activeSection === "library"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
        >
          <BookOpen className="w-4 h-4" /> Recovery Reading Library
        </button>
        <button
          onClick={() => setActiveSection("videos")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer
            ${
              activeSection === "videos"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
        >
          <Film className="w-4 h-4" /> Video Library
        </button>
      </div>

      {activeSection === "centers" && (
      <>
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
                <>
                  {userLocation.accuracy && (
                    <Circle
                      center={[userLocation.lat, userLocation.lng]}
                      radius={userLocation.accuracy}
                      pathOptions={{
                        color: "#0d9488",
                        fillColor: "#0d9488",
                        fillOpacity: 0.08,
                        weight: 1,
                      }}
                    />
                  )}
                  <Marker
                    position={[userLocation.lat, userLocation.lng]}
                    icon={makeUserIcon()}
                  >
                    <Popup>You are here</Popup>
                  </Marker>
                </>
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
                      <div className="flex gap-2 pt-1 flex-wrap">
                        {r.phone && (
                          <a
                            href={`tel:${r.phone}`}
                            className="text-xs font-medium text-teal-700 underline"
                          >
                            Call
                          </a>
                        )}
                        <a
                          href={directionsUrl(r, userLocation)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-teal-700 underline"
                        >
                          Directions
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
                    <div className="flex gap-2 pt-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
                      {r.phone && (
                        <a href={`tel:${r.phone}`} className="flex-1 min-w-[110px]">
                          <span className="flex items-center justify-center gap-1 h-8 rounded-lg text-xs font-medium text-white bg-teal-600 hover:bg-teal-500 transition-colors cursor-pointer">
                            <Phone className="w-3 h-3" /> {r.phone}
                          </span>
                        </a>
                      )}
                      <a
                        href={directionsUrl(r, userLocation)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-[110px]"
                      >
                        <span className="flex items-center justify-center gap-1 h-8 rounded-lg text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors cursor-pointer">
                          <Navigation className="w-3 h-3" /> Directions
                        </span>
                      </a>
                      {r.website && (
                        <a href={r.website} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[110px]">
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
      </>
      )}

      {activeSection === "library" && (
        <div className="space-y-5">
          {/* Trust banner */}
          <div className="flex items-start gap-3 bg-teal-50/60 border border-teal-100 rounded-2xl p-4">
            <ShieldCheck className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">
              Every item below comes from an established public-health body, hospital
              foundation, or long-running peer-support fellowship — never a random blog. Safe
              Haven doesn't host this material; each card links out to the publisher's own site.
            </p>
          </div>

          {/* Search + topic filter */}
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search readings by title or topic..."
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700
                  focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setLibraryTopic("All")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer
                  ${
                    libraryTopic === "All"
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white border-gray-200 text-gray-500 hover:border-teal-300"
                  }`}
              >
                All topics
              </button>
              {LIBRARY_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setLibraryTopic(topic.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer
                    ${
                      libraryTopic === topic.id
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-white border-gray-200 text-gray-500 hover:border-teal-300"
                    }`}
                >
                  <topic.Icon className="w-3.5 h-3.5" /> {topic.label}
                </button>
              ))}
            </div>
          </div>

          {/* Topic sections */}
          {filteredLibrary.length === 0 && (
            <div className="text-sm text-gray-400 italic px-1 py-10 text-center">
              No readings match your search.
            </div>
          )}

          {filteredLibrary.map((topic) => (
            <section
              key={topic.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-center gap-3 mb-1">
                <div className={`w-10 h-10 rounded-xl ${topic.bg} flex items-center justify-center flex-shrink-0`}>
                  <topic.Icon className={`w-5 h-5 ${topic.color}`} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">{topic.label}</h2>
                  <p className="text-xs text-gray-500">{topic.blurb}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {topic.readings.map((r) => (
                  <a
                    key={r.title}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl border border-gray-100 p-4 hover:border-teal-200 hover:shadow-sm transition-all cursor-pointer flex flex-col"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                        {r.title}
                      </h3>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-teal-500 flex-shrink-0 mt-0.5 transition-colors" />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap mb-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full border ${topic.badge}`}>
                        {r.format}
                      </span>
                      <span className="text-xs text-gray-400">{r.publisher}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{r.desc}</p>
                  </a>
                ))}
              </div>
            </section>
          ))}

          {/* Reassurance footer */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">
              Reading can help you understand your journey, but it isn't a substitute for
              treatment or crisis support. If you're struggling right now, visit{" "}
              <span className="font-medium text-gray-800">Crisis Support</span> or call the
              NACADA National Helpline on{" "}
              <a href="tel:1192" className="text-teal-600 font-medium underline">
                1192
              </a>
              .
            </p>
          </div>
        </div>
      )}

      {activeSection === "videos" && (
        <div className="space-y-5">
          {/* Trust banner */}
          <div className="flex items-start gap-3 bg-teal-50/60 border border-teal-100 rounded-2xl p-4">
            <ShieldCheck className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">
              For anyone who'd rather watch than read. Every video comes from an established
              organization — TED, an academic research center, a government health agency, or a
              recognized recovery non-profit — and plays on its original platform. Safe Haven
              doesn't host or re-upload any of this footage.
            </p>
          </div>

          {/* Search + topic filter */}
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search videos by title or topic..."
                value={videoSearch}
                onChange={(e) => setVideoSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700
                  focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setVideoTopic("All")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer
                  ${
                    videoTopic === "All"
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white border-gray-200 text-gray-500 hover:border-teal-300"
                  }`}
              >
                All topics
              </button>
              {VIDEO_LIBRARY.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setVideoTopic(topic.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer
                    ${
                      videoTopic === topic.id
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-white border-gray-200 text-gray-500 hover:border-teal-300"
                    }`}
                >
                  <topic.Icon className="w-3.5 h-3.5" /> {topic.label}
                </button>
              ))}
            </div>
          </div>

          {/* Topic sections */}
          {filteredVideos.length === 0 && (
            <div className="text-sm text-gray-400 italic px-1 py-10 text-center">
              No videos match your search.
            </div>
          )}

          {filteredVideos.map((topic) => (
            <section
              key={topic.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-center gap-3 mb-1">
                <div className={`w-10 h-10 rounded-xl ${topic.bg} flex items-center justify-center flex-shrink-0`}>
                  <topic.Icon className={`w-5 h-5 ${topic.color}`} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">{topic.label}</h2>
                  <p className="text-xs text-gray-500">{topic.blurb}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {topic.videos.map((v) => (
                  <a
                    key={v.title}
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl border border-gray-100 p-4 hover:border-teal-200 hover:shadow-sm transition-all cursor-pointer flex flex-col"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug flex items-start gap-1.5">
                        <PlayCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                        <span>{v.title}</span>
                      </h3>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-teal-500 flex-shrink-0 mt-0.5 transition-colors" />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap mb-2 ml-[22px]">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full border ${topic.badge}`}>
                        {v.format}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {v.duration}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 ml-[22px] mb-1">{v.publisher}</p>
                    <p className="text-xs text-gray-500 leading-relaxed ml-[22px]">{v.desc}</p>
                  </a>
                ))}
              </div>
            </section>
          ))}

          {/* Reassurance footer */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex items-start gap-3">
            <HeartHandshake className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">
              Videos can help you feel less alone and better understand what you're going
              through, but they aren't a substitute for treatment or crisis support. If you're
              struggling right now, visit{" "}
              <span className="font-medium text-gray-800">Crisis Support</span> or call the
              NACADA National Helpline on{" "}
              <a href="tel:1192" className="text-teal-600 font-medium underline">
                1192
              </a>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  );
}