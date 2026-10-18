// frontend/src/components/FurnitureMap.js
/**
 * Maps room types to their corresponding furniture configurations,
 * normalizes room labels, and filters allowed furniture based on the building type.
 */

export const furnitureMap = {
  Bedroom: ["bed", "wardrobe", "nightstand"],
  LivingRoom: ["sofa", "coffee_table", "tv_unit"],
  Kitchen: ["kitchen_counter", "cabinets", "fridge"],
  DiningRoom: ["dining_table", "dining_chairs"],
  Bathroom: ["toilet", "sink", "shower"],
  Office: ["office_desk", "office_chair", "bookshelf"],
  Study: ["office_desk", "office_chair", "bookshelf"],
  Gym: ["treadmill", "exercise_bench"],
  StoreRoom: ["storage_rack"],

  // Commercial
  Reception: ["reception_desk", "plant", "sofa"],
  MeetingRoom: ["conference_table", "dining_chairs", "whiteboard"],
  Cafeteria: ["dining_table", "dining_chairs", "kitchen_counter"],
  ServerRoom: ["storage_rack"],

  // Industrial
  Warehouse: ["storage_rack", "storage_rack"],
  ProductionArea: ["office_desk", "storage_rack"],
  LoadingDock: ["storage_rack"]
};

/**
 * Normalizes user-facing room labels to the keys used in furnitureMap.
 */
export const getRoomTypeFromLabel = (label) => {
  const lbl = (label || "").toLowerCase();
  if (lbl.includes("bedroom") || lbl.includes("sleeping")) return "Bedroom";
  if (lbl.includes("living") || lbl.includes("lounge")) return "LivingRoom";
  if (lbl.includes("kitchen") || lbl.includes("pantry")) return "Kitchen";
  if (lbl.includes("dining")) return "DiningRoom";
  if (lbl.includes("bathroom") || lbl.includes("toilet") || lbl.includes("wc") || lbl.includes("washroom") || lbl.includes("restroom") || lbl.includes("powder")) return "Bathroom";
  if (lbl.includes("home office")) return "Office";
  if (lbl.includes("office")) return "Office";
  if (lbl.includes("study")) return "Study";
  if (lbl.includes("gym") || lbl.includes("recreation") || lbl.includes("fitness")) return "Gym";
  if (lbl.includes("store") || lbl.includes("storage") || lbl.includes("utility") || lbl.includes("closet")) return "StoreRoom";
  if (lbl.includes("reception") || lbl.includes("lobby") || lbl.includes("entrance")) return "Reception";
  if (lbl.includes("meeting") || lbl.includes("conference") || lbl.includes("board")) return "MeetingRoom";
  if (lbl.includes("warehouse")) return "Warehouse";
  if (lbl.includes("production") || lbl.includes("factory") || lbl.includes("assembly")) return "ProductionArea";
  if (lbl.includes("loading") || lbl.includes("dock") || lbl.includes("receiving")) return "LoadingDock";
  return null;
};

/**
 * Checks whether a specific furniture item is allowed in a given building type
 * to prevent irrelevant furniture elements from showing up.
 */
export const isFurnitureAllowedForBuilding = (item, buildingType) => {
  const bType = (buildingType || "").toLowerCase();

  if (bType === "residential") {
    return [
      "bed",
      "wardrobe",
      "nightstand",
      "sofa",
      "coffee_table",
      "tv_unit",
      "kitchen_counter",
      "cabinets",
      "fridge",
      "dining_table",
      "dining_chairs",
      "toilet",
      "sink",
      "shower",
      "office_desk",
      "office_chair",
      "bookshelf",
      "treadmill",
      "exercise_bench",
      "storage_rack",
      "plant"
    ].includes(item);
  }

  if (bType === "commercial" || bType === "educational" || bType === "healthcare" || bType === "hotel") {
    return [
      "sofa",
      "coffee_table",
      "toilet",
      "sink",
      "office_desk",
      "office_chair",
      "bookshelf",
      "storage_rack",
      "plant",
      "reception_desk",
      "conference_table",
      "whiteboard",
      "kitchen_counter",
      "fridge",
      "dining_table",
      "dining_chairs"
    ].includes(item);
  }

  if (bType === "industrial") {
    return [
      "office_desk",
      "office_chair",
      "storage_rack",
      "toilet",
      "sink",
      "plant"
    ].includes(item);
  }

  return true;
};
