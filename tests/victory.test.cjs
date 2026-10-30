const { test } = require('node:test');
const assert = require('node:assert/strict');
const { victoryFor } = require('../dist/victory.js');
const day = {phase:'day', night:1};
test('la aldea gana al eliminar al último lobo', () => {
  assert.match(victoryFor(['Vidente','Hombre lobo'], [{alive:true},{alive:false}], day), /gana la aldea/);
});
test('los lobos ganan cuando no quedan otros jugadores', () => {
  assert.match(victoryFor(['Aldeano','Hombre lobo'], [{alive:false},{alive:true}], day), /gana la manada/);
});
test('la manada gana al alcanzar la paridad con los demás supervivientes', () => {
  const names = ['Hombre lobo', 'Hombre lobo', 'Aldeano', 'Bruja', 'Vidente'];
  const states = names.map(() => ({alive:true}));
  assert.equal(victoryFor(names, states, day), null);
  states[2].alive = false;
  assert.match(victoryFor(names, states, day), /gana la manada/);
});
test('el infectado sigue contando como lobo', () => {
  assert.match(victoryFor(['Vidente','Aldeano'], [{alive:true,wolf:true},{alive:true}], day), /gana la manada/);
});
test('el flautista gana cuando los demás supervivientes están hechizados', () => {
  assert.match(victoryFor(['Flautista','Hombre lobo'], [{alive:true},{alive:true,charmed:true}], day), /Flautista/);
});
test('la pareja mixta gana si es la única superviviente', () => {
  assert.match(victoryFor(['Vidente','Hombre lobo','Bruja'], [{alive:true,lover:true},{alive:true,lover:true},{alive:false}], day), /enamorados/);
});
test('el ángel gana solo con la causa y el momento adecuados', () => {
  assert.match(victoryFor(['Ángel','Aldeano'], [{alive:false,deathPhase:'day',deathNight:0,deathCause:'vote'},{alive:true}], {phase:'day',night:0}), /Ángel/);
  assert.equal(victoryFor(['Ángel','Aldeano'], [{alive:false,deathPhase:'day',deathNight:0,deathCause:'other'},{alive:true}], {phase:'day',night:0}), null);
});
test('el lobo albino debe ser el único superviviente', () => {
  assert.match(victoryFor(['Hombre lobo albino','Hombre lobo'], [{alive:true},{alive:false}], day), /albino/);
});
test('el sectario del asiento impar cumple su objetivo cuando mueren los pares', () => {
  const result = victoryFor(['Abominable sectario','Hombre lobo'], [{alive:true},{alive:false}], day);
  assert.match(result, /sectario también/);
});
test('el sectario no cumple su objetivo si queda vivo un asiento de distinta paridad', () => {
  const result = victoryFor(['Aldeano','Abominable sectario','Hombre lobo'], [{alive:true},{alive:true},{alive:false}], day);
  assert.match(result, /sectario no ha cumplido/);
});
test('el sectario de asiento par cumple su objetivo cuando los impares han muerto', () => {
  const result = victoryFor(['Hombre lobo','Abominable sectario','Aldeano'], [{alive:false},{alive:true},{alive:false}], day);
  assert.match(result, /sectario también/);
});
