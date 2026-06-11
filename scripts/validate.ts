import { SYSTEMS } from '../src/data/build';
import { checkOverlap, playerIndexInZone } from '../src/data/court';
import type { RotationNumber, Vec } from '../src/types';

let failures = 0;

for (const sys of SYSTEMS) {
  for (const rot of sys.rotations) {
    const r = rot.rotation as RotationNumber;
    // zone -> playerId
    const zonePlayer: Record<number, string> = {};
    for (let z = 1; z <= 6; z++) zonePlayer[z] = sys.players[playerIndexInZone(z, r)].id;

    for (const scenario of ['serve', 'receive'] as const) {
      const pre = rot[scenario].phases[0].positions;
      const zonePos: Record<number, Vec> = {};
      for (let z = 1; z <= 6; z++) {
        if (scenario === 'serve' && z === 1) continue; // server exempt
        zonePos[z] = pre[zonePlayer[z]];
      }
      const v = checkOverlap(zonePos);
      if (v.length) {
        failures++;
        console.log(`ILLEGAL ${sys.name} R${r} ${scenario}:`, v.map((x) => x.message).join('; '));
      }

      // Every player must have a position in every phase.
      for (const phase of rot[scenario].phases) {
        for (const p of sys.players) {
          if (!phase.positions[p.id]) {
            failures++;
            console.log(`MISSING POS ${sys.name} R${r} ${scenario} ${phase.id} ${p.id}`);
          }
        }
      }
    }

    // setter must exist
    if (!sys.players.find((p) => p.id === rot.setterId)) {
      failures++;
      console.log(`BAD SETTER ${sys.name} R${r}: ${rot.setterId}`);
    }
  }
}

console.log(failures === 0 ? 'ALL CHECKS PASSED ✓' : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
