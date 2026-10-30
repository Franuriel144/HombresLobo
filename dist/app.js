const form = document.querySelector('#player-form');
const input = document.querySelector('#player-name');
const seats = document.querySelector('#seats');
const list = document.querySelector('#player-list');
const storageKey = 'castronegro-players-v1';
let players = [];
try { const saved = JSON.parse(localStorage.getItem(storageKey) || '[]'); if (Array.isArray(saved)) players = saved.filter(p => typeof p === 'string' && p.trim()).slice(0, 100); } catch (_) {}
function save() { try { localStorage.setItem(storageKey, JSON.stringify(players)); } catch (_) {} }
function render() {
  seats.replaceChildren(); list.replaceChildren();
  document.querySelector('#counter').textContent = `${players.length} ${players.length === 1 ? 'jugador' : 'jugadores'}`;
  document.querySelector('#list-count').textContent = players.length;
  document.querySelector('#empty').hidden = players.length > 0;
  const board = document.querySelector('#board');
  const size = Math.max(460, players.length * 65 / Math.PI + 160);
  board.style.width = `${size}px`;
  board.style.height = `${size}px`;
  board.style.minHeight = `${size}px`;
  players.forEach((name, i) => {
    const angle = 2 * Math.PI * i / players.length - Math.PI / 2;
    const seat = document.createElement('div'); seat.className = 'seat';
    seat.style.left = `${50 + 38 * Math.cos(angle)}%`; seat.style.top = `${50 + 38 * Math.sin(angle)}%`;
    const avatar = document.createElement('div'); avatar.className = 'avatar'; avatar.textContent = name.trim().charAt(0).toLocaleUpperCase('es');
    const label = document.createElement('span'); label.className = 'seat-name'; label.textContent = name;
    const number = document.createElement('span'); number.className = 'seat-number'; number.textContent = String(i + 1).padStart(2, '0');
    seat.append(avatar, label, number); seats.append(seat);
    const item = document.createElement('li'); item.className = 'player-item';
    const icon = document.createElement('span'); icon.className = 'list-avatar'; icon.textContent = avatar.textContent;
    const info = document.createElement('div'); info.className = 'player-info';
    const title = document.createElement('strong'); title.textContent = name;
    const position = document.createElement('small'); position.textContent = `Asiento ${i + 1}`; info.append(title, position);
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove'; remove.textContent = '×'; remove.setAttribute('aria-label', `Eliminar a ${name}, asiento ${i + 1}`); remove.addEventListener('click', () => { players.splice(i, 1); save(); render(); });
    item.append(icon, info, remove); list.append(item);
  });
}
form.addEventListener('submit', event => { event.preventDefault(); const name = input.value.trim(); if (!name) return; players.push(name); save(); input.value = ''; render(); input.focus(); });
render();
