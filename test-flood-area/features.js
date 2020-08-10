export function getFeatures() {
  let clearances = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [-96.36626, 30.64976],
        },
        properties: {
          clearance: "13' 2",
        },
      },
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [-84.47208, 38.06694],
        },
        properties: {
          clearance: "13' 7",
        },
      },
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [-84.60485, 38.12184],
        },
        properties: {
          clearance: "13' 7",
        },
      },
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [-96.36209, 30.62734],
        },
        properties: {
          clearance: "12' 0",
        },
      },
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [-96.42408, 30.64278],
        },
        properties: {
          clearance: "13' 6",
        },
      },
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [-96.33109, 30.59333],
        },
        properties: {
          clearance: "20' 6",
        },
      },
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [-96.37629, 30.60168],
        },
        properties: {
          clearance: "11' 6",
        },
      },
    ],
  };
  return clearances;
}
