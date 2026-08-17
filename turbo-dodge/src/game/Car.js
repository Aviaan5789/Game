import * as THREE from 'three';

const WHEEL_RADIUS = 0.34;

function buildWheel() {
  const g = new THREE.CylinderGeometry(WHEEL_RADIUS, WHEEL_RADIUS, 0.28, 16);
  g.rotateZ(Math.PI / 2);
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.9, metalness: 0.1 });
  const wheel = new THREE.Mesh(g, tireMat);
  wheel.castShadow = true;
  const hubGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.3, 10);
  hubGeo.rotateZ(Math.PI / 2);
  const hub = new THREE.Mesh(hubGeo, new THREE.MeshStandardMaterial({ color: 0xbfc4cc, metalness: 0.7, roughness: 0.3 }));
  wheel.add(hub);
  return wheel;
}

export class Car {
  constructor(carDef) {
    this.group = new THREE.Group();
    this.wheels = [];
    this.materials = {};
    this.build(carDef);

    this.laneIndex = 1;
    this.laneX = 0;
    this.targetX = 0;
    this.tilt = 0;
    this.bobPhase = Math.random() * Math.PI * 2;
    this.isCrashed = false;
  }

  build(carDef) {
    const bodyMat = new THREE.MeshStandardMaterial({ color: carDef.body, metalness: 0.55, roughness: 0.35 });
    const accentMat = new THREE.MeshStandardMaterial({ color: carDef.accent, metalness: 0.4, roughness: 0.5 });
    const glassMat = new THREE.MeshStandardMaterial({ color: carDef.glass, metalness: 0.2, roughness: 0.1, transparent: true, opacity: 0.85 });
    this.materials.body = bodyMat;
    this.materials.accent = accentMat;

    // lower chassis
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.42, 3.6), bodyMat);
    chassis.position.y = 0.5;
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    this.group.add(chassis);

    // cabin
    const cabinGeo = new THREE.BoxGeometry(1.5, 0.5, 1.9);
    const cabin = new THREE.Mesh(cabinGeo, bodyMat);
    cabin.position.set(0, 0.92, -0.15);
    cabin.castShadow = true;
    this.group.add(cabin);

    // windshield + windows
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.42, 1.1), glassMat);
    windshield.position.set(0, 0.94, 0.55);
    this.group.add(windshield);

    // hood + trunk accent stripes
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.12, 1.1), accentMat);
    hood.position.set(0, 0.74, 1.35);
    this.group.add(hood);

    const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.25), accentMat);
    spoiler.position.set(0, 1.05, -1.75);
    this.group.add(spoiler);
    const spoilerL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.25), accentMat);
    spoilerL.position.set(-0.65, 0.85, -1.75);
    const spoilerR = spoilerL.clone();
    spoilerR.position.x = 0.65;
    this.group.add(spoilerL, spoilerR);

    // headlights
    const headlightGeo = new THREE.BoxGeometry(0.3, 0.14, 0.08);
    const headlightMat = new THREE.MeshStandardMaterial({ color: 0xfff6d0, emissive: 0xfff2b0, emissiveIntensity: 1.4 });
    const hlL = new THREE.Mesh(headlightGeo, headlightMat);
    hlL.position.set(-0.62, 0.55, 1.82);
    const hlR = hlL.clone();
    hlR.position.x = 0.62;
    this.group.add(hlL, hlR);

    // taillights
    const tailMat = new THREE.MeshStandardMaterial({ color: 0xff2233, emissive: 0xff0022, emissiveIntensity: 1.2 });
    const tlL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.06), tailMat);
    tlL.position.set(-0.6, 0.55, -1.83);
    const tlR = tlL.clone();
    tlR.position.x = 0.6;
    this.group.add(tlL, tlR);
    this.tailLights = [tlL, tlR];
    this.tailLightMat = tailMat;

    // wheels
    const wheelOffsets = [
      [-0.92, 0.36, 1.15],
      [0.92, 0.36, 1.15],
      [-0.92, 0.36, -1.15],
      [0.92, 0.36, -1.15],
    ];
    for (const [x, y, z] of wheelOffsets) {
      const wheel = buildWheel();
      wheel.position.set(x, y, z);
      this.group.add(wheel);
      this.wheels.push(wheel);
    }

    this.group.position.y = 0;
    this.group.traverse((o) => {
      if (o.isMesh) o.castShadow = true;
    });
  }

  setLane(laneIndex, laneWidth) {
    this.laneIndex = laneIndex;
    this.targetX = (laneIndex - 1) * laneWidth;
  }

  setColor(carDef) {
    this.materials.body.color.setHex(carDef.body);
    this.materials.accent.color.setHex(carDef.accent);
  }

  update(dt, speed, braking) {
    const prevX = this.group.position.x;
    const smoothing = 1 - Math.exp(-8 * dt);
    this.group.position.x += (this.targetX - this.group.position.x) * smoothing;
    const dx = this.group.position.x - prevX;

    // banking tilt based on lateral velocity
    const targetTilt = THREE.MathUtils.clamp(-dx * 6, -0.2, 0.2);
    this.tilt += (targetTilt - this.tilt) * (1 - Math.exp(-10 * dt));
    this.group.rotation.z = this.tilt;
    this.group.rotation.y = THREE.MathUtils.clamp(-dx * 2.5, -0.1, 0.1);

    // suspension bob + wheel spin
    this.bobPhase += dt * speed * 1.6;
    this.group.position.y = Math.sin(this.bobPhase) * 0.015;
    for (const wheel of this.wheels) {
      wheel.rotation.x -= dt * speed * 2.4;
    }

    if (this.tailLightMat) {
      this.tailLightMat.emissiveIntensity = braking ? 3 : 1.2;
    }
  }

  get x() {
    return this.group.position.x;
  }
}
