import React from "react";

/**
 * RoomVisualization Component
 * Renders a simple grid of rooms with basic interior objects.
 * Props:
 *   - rooms: Array of room objects with { name, type, objects }
 *   - onRoomSelect: optional callback when a room is clicked
 */
export default function RoomVisualization({ rooms = [], onRoomSelect }) {
  return (
    <div style={styles.container}>
      {rooms.map((room, idx) => (
        <div
          key={idx}
          style={styles.roomCard}
          onClick={() => onRoomSelect && onRoomSelect(room)}
        >
          <h3 style={styles.roomTitle}>{room.name}</h3>
          <p style={styles.roomType}>Type: {room.type}</p>
          <ul style={styles.objectList}>
            {(room.objects || []).map((obj, i) => (
              <li key={i} style={styles.objectItem}>• {obj}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "1.5rem",
    padding: "2rem",
  },
  roomCard: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid var(--glass-border)",
    borderRadius: "12px",
    padding: "1rem",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  roomTitle: {
    margin: 0,
    fontSize: "1.1rem",
    color: "var(--eco-glow)",
  },
  roomType: {
    margin: "0.3rem 0",
    fontSize: "0.9rem",
    color: "var(--text-secondary)",
  },
  objectList: {
    margin: 0,
    paddingLeft: "1rem",
    fontSize: "0.85rem",
    color: "#fff",
  },
  objectItem: {
    marginBottom: "0.2rem",
  },
};
