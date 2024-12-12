import { setupDraggables, adjustDropzoneSize, resetDropzoneSize } from "./uiDrag.js";
import { generateCards } from "./letterGenerator.js";

document.addEventListener("DOMContentLoaded", () => {
  const dropzones = document.querySelectorAll(".dropzone");
  const colors = {
    "dropzone1": "#3498db",
    "dropzone2": "#e74c3c"
  };

  const cards = generateCards();
  const half = Math.ceil(cards.length / 2);

  dropzones[0].append(...cards.slice(0, half).map(card => {
    card.style.backgroundColor = colors["dropzone1"];
    return card;
  }));
  dropzones[1].append(...cards.slice(half).map(card => {
    card.style.backgroundColor = colors["dropzone2"];
    return card;
  }));

  const draggables = document.querySelectorAll(".card");
  setupDraggables(draggables, dropzones, colors);

  // Cargar posiciones guardadas
  fetch('/get-positions')
    .then(response => response.json())
    .then(data => {
      Object.keys(data).forEach(zoneId => {
        const zone = document.getElementById(zoneId);
        data[zoneId].forEach(cardId => {
          const card = document.getElementById(cardId);
          if (card) {
            zone.appendChild(card);
            card.style.backgroundColor = colors[zoneId]; // Asignar color correspondiente
          }
        });
        // Ajustar tamaño del contenedor
        const allCards = zone.querySelectorAll(".card");
        allCards.length > 6 ? adjustDropzoneSize(zone) : resetDropzoneSize(zone);
      });
    });
});

function saveCardPositions() {
  const positions = {};
  document.querySelectorAll('.dropzone').forEach(zone => {
    const zoneId = zone.id;
    positions[zoneId] = [];
    zone.querySelectorAll('.card').forEach(card => {
      positions[zoneId].push(card.id);
    });
  });

  fetch('/save-positions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(positions)
  });
}

document.addEventListener('drop', saveCardPositions);
document.addEventListener('dragend', saveCardPositions);