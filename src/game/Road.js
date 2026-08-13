import * as THREE from 'three';

const SEGMENT_LENGTH = 24;
const SEGMENT_COUNT = 10;
const ROAD_WIDTH = 11;

export class Road {
  constructor(scene, laneWidth) {
    this.scene = scene;
    this.laneWidth = laneWidth;
    this.segments = [];
    this.scenery = [];
    this.group = new THREE.Group();
    scene.add(this.group);

    this.buildSegments();
    this.buildScenery();
  }

  buildSegments() {
    const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x2b2d33, roughness: 0.95, metalness: 0.02 });
    const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x3c3f46, roughness: 1 });
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xf3d95a, emissive: 0x2b2408, roughness: 0.6 });

    for (let i = 0; i < SEGMENT_COUNT; i++) {
      const seg = new THREE.Group();

      const road = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_WIDTH, SEGMENT_LENGTH), asphaltMat);
      road.rotation.x = -Math.PI / 2;
      road.receiveShadow = true;
      seg.add(road);

      const shoulderL = new THREE.Mesh(new THREE.PlaneGeometry(3, SEGMENT_LENGTH), shoulderMat);
      shoulderL.rotation.x = -Math.PI / 2;
      shoulderL.position.set(-(ROAD_WIDTH / 2 + 1.5), -0.01, 0);
      shoulderL.receiveShadow = true;
      const shoulderR = shoulderL.clone();
      shoulderR.position.x = ROAD_WIDTH / 2 + 1.5;
      seg.add(shoulderL, shoulderR);

      // lane divider stripes (dashed) between lane 0/1 and lane 1/2
      for (const laneEdge of [-this.laneWidth / 2, this.laneWidth / 2]) {
        for (let s = -SEGMENT_LENGTH / 2 + 1; s < SEGMENT_LENGTH / 2; s += 4) {
          const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 2), stripeMat);
          stripe.rotation.x = -Math.PI / 2;
          stripe.position.set(laneEdge, 0.01, s);
          seg.add(stripe);
        }
      }

      seg.position.z = -i * SEGMENT_LENGTH;
      this.group.add(seg);
      this.segments.push(seg);
    }
  }

  buildScenery() {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5b3d24, roughness: 1 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2f9e44, roughness: 0.85 });
    const buildingMats = [0x24303f, 0x2c2540, 0x1f3a3a, 0x33293f].map(
      (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 })
    );
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1e, roughness: 0.6 });
    const lampGlow = new THREE.MeshStandardMaterial({ color: 0xfff2b3, emissive: 0xffe27a, emissiveIntensity: 1.6 });

    const SIDE = ROAD_WIDTH / 2 + 3.2;
    for (let i = 0; i < SEGMENT_COUNT; i++) {
      for (const side of [-1, 1]) {
        const cluster = new THREE.Group();
        const kind = i % 3;

        if (kind === 0) {
          // tree
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.6, 6), trunkMat);
          trunk.position.y = 0.8;
          const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 0), leafMat);
          leaves.position.y = 2.1;
          leaves.castShadow = true;
          trunk.castShadow = true;
          cluster.add(trunk, leaves);
        } else if (kind === 1) {
          // building
          const h = 6 + ((i * 7) % 10);
          const mat = buildingMats[(i + (side > 0 ? 1 : 0)) % buildingMats.length];
          const building = new THREE.Mesh(new THREE.BoxGeometry(3.4, h, 3.4), mat);
          building.position.y = h / 2;
          building.castShadow = true;
          building.receiveShadow = true;
          cluster.add(building);
          // little glowing windows strip
          for (let w = 1; w < h - 1; w += 1.4) {
            const win = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.4), lampGlow);
            win.position.set(0, w, 1.71);
            cluster.add(win);
          }
        } else {
          // street lamp
          const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.4, 6), lampMat);
          pole.position.y = 1.7;
          const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), lampGlow);
          bulb.position.y = 3.4;
          cluster.add(pole, bulb);
        }

        cluster.position.set(side * (SIDE + Math.random() * 3), 0, -i * SEGMENT_LENGTH + (Math.random() - 0.5) * 6);
        this.group.add(cluster);
        this.scenery.push(cluster);
      }
    }
  }

  update(distanceDelta, refZ) {
    for (const seg of this.segments) {
      seg.position.z += distanceDelta;
      if (seg.position.z - SEGMENT_LENGTH / 2 > refZ + 10) {
        seg.position.z -= SEGMENT_COUNT * SEGMENT_LENGTH;
      }
    }
    for (const item of this.scenery) {
      item.position.z += distanceDelta;
      if (item.position.z > refZ + 20) {
        item.position.z -= SEGMENT_COUNT * SEGMENT_LENGTH;
      }
    }
  }
}

export { SEGMENT_LENGTH, SEGMENT_COUNT, ROAD_WIDTH };
