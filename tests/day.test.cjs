const {test} = require('node:test');
const assert = require('node:assert/strict');
const {votingMajority, eliminateByVote} = require('../dist/day.js');
const setup = names => ({phase:'day', night:1, states:names.map((_, i) => ({id:String(i), alive:true})), offices:{alcalde:null,guardia:null}, settings:{fierce:true}});
test('calcula la mayoría con el voto doble del alcalde', () => { const n=['Aldeano','Vidente','Bruja','Hombre lobo']; const g=setup(n); g.offices.alcalde=0; assert.deepEqual(votingMajority(n,g.states,g.offices),{voters:4,total:5,majority:3,mayorVote:1}); });
test('excluye a muertos y a quien no puede votar', () => { const n=['Aldeano','Vidente','Bruja']; const g=setup(n); g.states[0].alive=false; g.states[1].canVote=false; g.offices.alcalde=0; assert.deepEqual(votingMajority(n,g.states,g.offices),{voters:1,total:1,majority:1,mayorVote:0}); });
test('el resultado elimina al jugador y al enamorado', () => { const n=['Aldeano','Vidente','Hombre lobo']; const g=setup(n); g.states[0].lover=g.states[1].lover=true; assert.equal(eliminateByVote(g,n,0).ok,true); assert.equal(g.states[0].alive,false); assert.equal(g.states[1].alive,false); assert.equal(g.states[2].alive,true); });
test('el Tonto sobrevive y pierde su voto', () => { const n=['Tonto de la aldea','Aldeano']; const g=setup(n); g.offices.alcalde=0; eliminateByVote(g,n,0); assert.equal(g.states[0].alive,true); assert.equal(g.states[0].canVote,false); assert.equal(g.offices.alcalde,null); assert.equal(eliminateByVote(g,n,0).ok,false); });
test('si muere el modelo, el niño pasa a ser lobo', () => { const n=['Niño salvaje','Aldeano']; const g=setup(n); g.childModel='1'; eliminateByVote(g,n,1); assert.equal(g.states[0].wolf,true); });
