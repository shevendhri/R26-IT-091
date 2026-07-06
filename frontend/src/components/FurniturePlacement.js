// frontend/src/components/FurniturePlacement.js
import { furnitureMap, isFurnitureAllowedForBuilding } from "./FurnitureMap";

/**
 * Intelligent Layout Engine
 * Calculates local positions [x, y, z], rotations, and scales for each furniture item
 * in a room of size w x h based on building requirements and type.
 */
export function getFurniturePlacement(roomType, w, h, buildingRequirements = {}, buildingType = "Residential") {
  const items = furnitureMap[roomType] || [];
  const placed = [];
  const area = w * h;

  // Rule: Scale down furniture if room is very small to avoid overcrowding
  let scaleFactor = 1.0;
  if (area < 8.0) {
    scaleFactor = 0.82;
  } else if (area < 12.0) {
    scaleFactor = 0.90;
  }

  // Filter items allowed in this building type
  const allowedItems = items.filter(item => isFurnitureAllowedForBuilding(item, buildingType));

  // If the room is extremely small, only keep the most essential items (first 2 items)
  const finalItems = area < 7.0 ? allowedItems.slice(0, 2) : allowedItems;

  // Placement strategies based on Room Type
  switch (roomType) {
    case "Bedroom":
      finalItems.forEach(item => {
        if (item === "bed") {
          placed.push({
            name: "bed",
            pos: [0, 0, -h / 2 + 1.1 * scaleFactor],
            rot: [0, 0, 0],
            scale: [scaleFactor, scaleFactor, scaleFactor]
          });
        } else if (item === "wardrobe") {
          placed.push({
            name: "wardrobe",
            pos: [w / 2 - 0.35 * scaleFactor, 0, 0],
            rot: [0, -Math.PI / 2, 0],
            scale: [scaleFactor, scaleFactor, scaleFactor]
          });
        } else if (item === "nightstand") {
          // Nightstand flanking the bed if space permits
          if (w > 2.8) {
            placed.push({
              name: "nightstand",
              pos: [-1.05 * scaleFactor, 0, -h / 2 + 0.3 * scaleFactor],
              rot: [0, 0, 0],
              scale: [scaleFactor, scaleFactor, scaleFactor]
            });
          }
        }
      });
      break;

    case "LivingRoom":
      finalItems.forEach(item => {
        if (item === "sofa") {
          placed.push({
            name: "sofa",
            pos: [0, 0, h / 4],
            rot: [0, Math.PI, 0],
            scale: [scaleFactor, scaleFactor, scaleFactor]
          });
        } else if (item === "coffee_table") {
          placed.push({
            name: "coffee_table",
            pos: [0, 0, h / 4 - 0.9 * scaleFactor],
            rot: [0, 0, 0],
            scale: [scaleFactor, scaleFactor, scaleFactor]
          });
        } else if (item === "tv_unit") {
          placed.push({
            name: "tv_unit",
            pos: [0, 0, -h / 2 + 0.25 * scaleFactor],
            rot: [0, 0, 0],
            scale: [scaleFactor, scaleFactor, scaleFactor]
          });
        }
      });
      break;

    case "Kitchen":
      finalItems.forEach(item => {
        if (item === "kitchen_counter") {
          placed.push({
            name: "kitchen_counter",
            pos: [0, 0, h / 2 - 0.35 * scaleFactor],
            rot: [0, Math.PI, 0],
            scale: [scaleFactor, scaleFactor, scaleFactor]
          });
        } else if (item === "cabinets") {
          placed.push({
            name: "cabinets",
            pos: [0, 1.25, h / 2 - 0.18 * scaleFactor],
            rot: [0, Math.PI, 0],
            scale: [scaleFactor, scaleFactor, scaleFactor]
          });
        } else if (item === "fridge") {
          placed.push({
            name: "fridge",
            pos: [-w / 2 + 0.45 * scaleFactor, 0, h / 2 - 0.45 * scaleFactor],
            rot: [0, Math.PI, 0],
            scale: [scaleFactor, scaleFactor, scaleFactor]
          });
        }
      });
      break;

    case "DiningRoom":
      finalItems.forEach(item => {
        if (item === "dining_table") {
          placed.push({
            name: "dining_table",
            pos: [0, 0, 0],
            rot: [0, 0, 0],
            scale: [scaleFactor, scaleFactor, scaleFactor]
          });
        } else if (item === "dining_chairs") {
          // Add 4 chairs around the table
          placed.push({ name: "dining_chair", pos: [-0.85 * scaleFactor, 0, 0], rot: [0, Math.PI / 2, 0], scale: [scaleFactor, scaleFactor, scaleFactor] });
          placed.push({ name: "dining_chair", pos: [0.85 * scaleFactor, 0, 0], rot: [0, -Math.PI / 2, 0], scale: [scaleFactor, scaleFactor, scaleFactor] });
          placed.push({ name: "dining_chair", pos: [0, 0, -0.6 * scaleFactor], rot: [0, 0, 0], scale: [scaleFactor, scaleFactor, scaleFactor] });
          placed.push({ name: "dining_chair", pos: [0, 0, 0.6 * scaleFactor], rot: [0, Math.PI, 0], scale: [scaleFactor, scaleFactor, scaleFactor] });
        }
      });
      break;

    case "Bathroom":
      finalItems.forEach(item => {
        if (item === "toilet") {
          placed.push({
            name: "toilet",
            pos: [-w / 3, 0, -h / 2 + 0.35 * scaleFactor],
            rot: [0, 0, 0],
            scale: [scaleFactor, scaleFactor, scaleFactor]
          });
        } else if (item === "sink") {
          placed.push({
            name: "sink",
            pos: [w / 3, 0, -h / 2 + 0.3 * scaleFactor],
            rot: [0, 0, 0],
            scale: [scaleFactor, scaleFactor, scaleFactor]
          });
        } else if (item === "shower") {
          placed.push({
            name: "shower",
            pos: [w / 2 - 0.5 * scaleFactor, 0, h / 2 - 0.5 * scaleFactor],
            rot: [0, 0, 0],
            scale: [scaleFactor, scaleFactor, scaleFactor]
          });
        }
      });
      break;

    case "Office":
    case "Study":
      finalItems.forEach(item => {
        if (item === "office_desk") {
          placed.push({
            name: "office_desk",
            pos: [0, 0, -0.1],
            rot: [0, 0, 0],
            scale: [scaleFactor, scaleFactor, scaleFactor]
          });
        } else if (item === "office_chair") {
          placed.push({
            name: "office_chair",
            pos: [0, 0, 0.5 * scaleFactor],
            rot: [0, Math.PI, 0],
            scale: [scaleFactor, scaleFactor, scaleFactor]
          });
        } else if (item === "bookshelf") {
          placed.push({
            name: "bookshelf",
            pos: [-w / 2 + 0.2 * scaleFactor, 0, 0],
            rot: [0, Math.PI / 2, 0],
            scale: [scaleFactor, scaleFactor, scaleFactor]
          });
        }
      });
      break;

    case "Gym":
      finalItems.forEach(item => {
        if (item === "treadmill") {
          placed.push({
            name: "treadmill",
            pos: [-w / 4, 0, 0],
            rot: [0, 0, 0],
            scale: [scaleFactor, scaleFactor, scaleFactor]
          });
        } else if (item === "exercise_bench") {
          placed.push({
            name: "exercise_bench",
            pos: [w / 4, 0, 0],
            rot: [0, Math.PI / 2, 0],
            scale: [scaleFactor, scaleFactor, scaleFactor]
          });
        }
      });
      break;

    case "StoreRoom":
      finalItems.forEach(item => {
        if (item === "storage_rack") {
          placed.push({
            name: "storage_rack",
            pos: [-w / 2 + 0.3 * scaleFactor, 0, 0],
            rot: [0, Math.PI / 2, 0],
            scale: [scaleFactor, scaleFactor, scaleFactor]
          });
        }
      });
      break;

    case "Reception":
      finalItems.forEach(item => {
        if (item === "reception_desk") {
          placed.push({
            name: "reception_desk",
            pos: [0, 0, -h / 6],
            rot: [0, 0, 0],
            scale: [scaleFactor, scaleFactor, scaleFactor]
          });
        } else if (item === "plant") {
          placed.push({
            name: "plant",
            pos: [w / 2 - 0.4 * scaleFactor, 0, -h / 2 + 0.4 * scaleFactor],
            rot: [0, 0, 0],
            scale: [scaleFactor, scaleFactor, scaleFactor]
          });
        } else if (item === "sofa") {
          placed.push({
            name: "sofa",
            pos: [0, 0, h / 3],
            rot: [0, Math.PI, 0],
            scale: [scaleFactor, scaleFactor, scaleFactor]
          });
        }
      });
      break;

    case "MeetingRoom":
      finalItems.forEach(item => {
        if (item === "conference_table") {
          placed.push({
            name: "conference_table",
            pos: [0, 0, 0],
            rot: [0, 0, 0],
            scale: [scaleFactor, scaleFactor, scaleFactor]
          });
        } else if (item === "dining_chairs") {
          // Place 6 chairs around conference table
          placed.push({ name: "dining_chair", pos: [-1.2 * scaleFactor, 0, -0.4 * scaleFactor], rot: [0, Math.PI / 2, 0], scale: [scaleFactor, scaleFactor, scaleFactor] });
          placed.push({ name: "dining_chair", pos: [-1.2 * scaleFactor, 0, 0.4 * scaleFactor], rot: [0, Math.PI / 2, 0], scale: [scaleFactor, scaleFactor, scaleFactor] });
          placed.push({ name: "dining_chair", pos: [1.2 * scaleFactor, 0, -0.4 * scaleFactor], rot: [0, -Math.PI / 2, 0], scale: [scaleFactor, scaleFactor, scaleFactor] });
          placed.push({ name: "dining_chair", pos: [1.2 * scaleFactor, 0, 0.4 * scaleFactor], rot: [0, -Math.PI / 2, 0], scale: [scaleFactor, scaleFactor, scaleFactor] });
          placed.push({ name: "dining_chair", pos: [0, 0, -0.8 * scaleFactor], rot: [0, 0, 0], scale: [scaleFactor, scaleFactor, scaleFactor] });
          placed.push({ name: "dining_chair", pos: [0, 0, 0.8 * scaleFactor], rot: [0, Math.PI, 0], scale: [scaleFactor, scaleFactor, scaleFactor] });
        } else if (item === "whiteboard") {
          placed.push({
            name: "whiteboard",
            pos: [0, 0.9, -h / 2 + 0.05],
            rot: [0, 0, 0],
            scale: [scaleFactor, scaleFactor, scaleFactor]
          });
        }
      });
      break;

    case "Warehouse":
      // Rows of racks in warehouse
      placed.push({ name: "storage_rack", pos: [-w / 4, 0, -h / 4], rot: [0, 0, 0], scale: [scaleFactor, scaleFactor, scaleFactor] });
      placed.push({ name: "storage_rack", pos: [-w / 4, 0, h / 4], rot: [0, 0, 0], scale: [scaleFactor, scaleFactor, scaleFactor] });
      placed.push({ name: "storage_rack", pos: [w / 4, 0, -h / 4], rot: [0, 0, 0], scale: [scaleFactor, scaleFactor, scaleFactor] });
      placed.push({ name: "storage_rack", pos: [w / 4, 0, h / 4], rot: [0, 0, 0], scale: [scaleFactor, scaleFactor, scaleFactor] });
      break;

    default:
      // Fallback placement: just place a small desk and chair in center
      if (finalItems.includes("office_desk")) {
        placed.push({ name: "office_desk", pos: [0, 0, 0], rot: [0, 0, 0], scale: [scaleFactor, scaleFactor, scaleFactor] });
      }
      break;
  }

  // Phase 2: Elderly accessibility grab bar in bathrooms
  if (roomType === "Bathroom" && buildingRequirements?.elderly_access_required) {
    placed.push({
      name: "grab_bar",
      pos: [-w / 3 - 0.25, 0.8, -h / 2 + 0.35], // Near toilet
      rot: [0, Math.PI / 2, 0],
      scale: [1, 1, 1]
    });
  }

  return placed;
}
