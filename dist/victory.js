// Evaluates only outcomes supported by recorded state; the narrator resolves chained effects.
function victoryFor(players, states, game) {
  if (game.phase === 'preparation' || !players.length) return null;
  const living = players.map((name, i) => ({name, state: states[i] || {}, i})).filter(p => p.state.alive !== false);
  const isWolf = p => !!p.state.wolf || ['Hombre lobo', 'Lobo feroz', 'Infecto padre de los lobos', 'Hombre lobo albino'].includes(p.name);
  const angel = players.findIndex((name, i) => name === 'Ángel' && states[i]?.alive === false && ((states[i]?.deathCause === 'vote' && states[i]?.deathPhase === 'day' && states[i]?.deathNight === 0) || (states[i]?.deathCause === 'wolves' && states[i]?.deathPhase === 'night' && states[i]?.deathNight === 1)));
  if (angel >= 0) return 'El Ángel ha cumplido su objetivo y gana la partida.';
  const piper = living.find(p => p.name === 'Flautista' && !isWolf(p));
  if (piper && game.night > 0 && living.every(p => p.i === piper.i || p.state.charmed)) return 'El Flautista ha hechizado a todos los demás supervivientes y gana la partida.';
  const lovers = living.filter(p => p.state.lover);
  const side = p => isWolf(p) ? 'lobo' : p.name === 'Flautista' ? 'flautista' : 'aldea';
  if (living.length === 2 && lovers.length === 2 && side(lovers[0]) !== side(lovers[1])) return 'Los enamorados de bandos distintos son los únicos supervivientes y ganan la partida.';
  if (living.length === 1 && living[0].name === 'Hombre lobo albino') return 'El Hombre lobo albino es el único superviviente y gana la partida.';
  if (game.night === 0 || living.length === 0) return null;
  const wolves = living.filter(isWolf), nonWolves = living.filter(p => !isWolf(p));
  let result = null;
  if (!wolves.length && players.some((name, i) => isWolf({name, state: states[i] || {}}))) result = 'Ya no quedan hombres lobo vivos: gana la aldea.';
  else if (wolves.length >= nonWolves.length && wolves.some(p => p.name !== 'Hombre lobo albino')) result = 'Los hombres lobo igualan o superan a los demás supervivientes: gana la manada.';
  if (!result) return null;
  const sectarian = players.findIndex((name, i) => name === 'Abominable sectario' && !states[i]?.wolf);
  if (sectarian >= 0) {
    const group = sectarian % 2;
    if (living.every(p => p.i % 2 === group)) result += ' El sectario también ha cumplido su objetivo.';
    else result += ' El sectario no ha cumplido su objetivo.';
  }
  return result;
}
if (typeof module !== 'undefined') module.exports = {victoryFor};
