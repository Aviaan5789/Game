import * as THREE from 'three';

export class ExhaustTrail {
  constructor(scene, carGroup) {
    this.scene = scene;
    this.carGroup = carGroup;
    const count = 40;
    this.count = count;
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(count * 3);
    this.ages = new Float32Array(count).fill(999);
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xaab4c2,
      size: 0.4,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    this.points = new THREE.Points(this.geometry, material);
    scene.add(this.points);
    this.timer = 0;
    this.cursor = 0;
  }

  update(dt, speed, carZ) {
    this.timer -= dt;
    if (this.timer <= 0) {
      this.timer = 0.03;
      const i = this.cursor;
      this.cursor = (this.cursor + 1) % this.count;
      this.ages[i] = 0;
      const idx = i * 3;
      this.positions[idx] = this.carGroup.position.x + (Math.random() - 0.5) * 0.3;
      this.positions[idx + 1] = 0.3;
      this.positions[idx + 2] = carZ + 1.9;
    }
    for (let i = 0; i < this.count; i++) {
      if (this.ages[i] > 1.2) continue;
      this.ages[i] += dt;
      const idx = i * 3;
      this.positions[idx + 1] += dt * 0.6;
      this.positions[idx + 2] += dt * speed * 0.4;
    }
    this.geometry.attributes.position.needsUpdate = true;
  }

  dispose() {
    this.scene.remove(this.points);
    this.geometry.dispose();
    this.points.material.dispose();
  }
}

export class CrashBurst {
  constructor(scene) {
    this.scene = scene;
    this.count = 120;
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.count * 3);
    this.velocities = new Float32Array(this.count * 3);
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xffb347,
      size: 0.22,
      transparent: true,
      opacity: 1,
      depthWrite: false,
    });
    this.material = material;
    this.points = new THREE.Points(this.geometry, material);
    this.points.visible = false;
    scene.add(this.points);
    this.life = 0;
    this.maxLife = 1.1;
  }

  burst(x, y, z) {
    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      this.positions[idx] = x;
      this.positions[idx + 1] = y + 0.4;
      this.positions[idx + 2] = z;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 2 + Math.random() * 5;
      this.velocities[idx] = Math.sin(phi) * Math.cos(theta) * speed;
      this.velocities[idx + 1] = Math.abs(Math.cos(phi)) * speed;
      this.velocities[idx + 2] = Math.sin(phi) * Math.sin(theta) * speed;
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.life = this.maxLife;
    this.points.visible = true;
    this.material.opacity = 1;
  }

  update(dt) {
    if (this.life <= 0) return;
    this.life -= dt;
    this.material.opacity = Math.max(0, this.life / this.maxLife);
    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      this.velocities[idx + 1] -= dt * 9; // gravity
      this.positions[idx] += this.velocities[idx] * dt;
      this.positions[idx + 1] += this.velocities[idx + 1] * dt;
      this.positions[idx + 2] += this.velocities[idx + 2] * dt;
    }
    this.geometry.attributes.position.needsUpdate = true;
    if (this.life <= 0) this.points.visible = false;
  }
}
