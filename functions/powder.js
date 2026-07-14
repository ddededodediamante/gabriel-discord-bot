const SAND = 1;
const WATER = 2;
const LAVA = 3;
const OBSIDIAN = 4;
const ACID = 5;
const SMOKE = 6;

const LIQUIDS = [WATER, LAVA, ACID];
const POWDERS = [SAND];
const SOLIDS = [OBSIDIAN];
const GASES = [SMOKE];

const DENSITY = {
  [SMOKE]: -1,
  0: 0,
  [WATER]: 1,
  [LAVA]: 1,
  [SAND]: 2,
  [OBSIDIAN]: 3,
  [ACID]: 67
};

const is = (a, b) => {
  if (b === "liquid" && LIQUIDS.includes(a)) return true;
  if (b === "powder" && POWDERS.includes(a)) return true;
  if (b === "solid" && SOLIDS.includes(a)) return true;
  if (b === "gas" && GASES.includes(a)) return true;
  return false;
};

class PowderSim {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.grid = new Uint8Array(width * height);
  }

  get(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return -1;
    }
    return this.grid[y * this.width + x];
  }

  set(x, y, type) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.grid[y * this.width + x] = type;
    }
  }

  swap(x1, y1, x2, y2) {
    if (
      x1 < 0 ||
      x1 >= this.width ||
      y1 < 0 ||
      y1 >= this.height ||
      x2 < 0 ||
      x2 >= this.width ||
      y2 < 0 ||
      y2 >= this.height
    ) {
      return false;
    }

    const one = this.get(x1, y1);
    const two = this.get(x2, y2);

    if (is(one, "solid") || is(two, "solid")) {
      return false;
    }

    if (one === two) {
      return false;
    }

    if (one !== 0 && two !== 0 && (one === ACID || two === ACID)) {
      this.set(x1, y1, 0);
      this.set(x2, y2, 0);
    } else {
      this.set(x1, y1, two);
      this.set(x2, y2, one);
    }
    return true;
  }

  step() {
    let moved = 0;

    for (let y = this.height - 2; y >= 0; y--) {
      const dir = Math.random() > 0.5;
      const start = dir ? 0 : this.width;
      const end = dir ? this.width : 0;
      const add = dir ? 1 : -1;

      for (let x = start; x !== end; x += add) {
        const type = this.get(x, y);
        if (SOLIDS.includes(type)) continue;

        const liquid = LIQUIDS.includes(type);
        const powder = POWDERS.includes(type);
        const below = this.get(x, y + 1);

        if (!powder && below === 0) {
          if (this.swap(x, y, x, y + 1)) moved++;
          continue;
        }

        if (type === WATER && below === LAVA) {
          this.set(x, y, 0);
          this.set(x, y + 1, OBSIDIAN);
          moved++;
          continue;
        }

        if (powder || liquid) {
          const dir = Math.random() < 0.5 ? -1 : 1;

          const diag = this.get(x + dir, y + 1);
          const side = this.get(x + dir, y);
          if (!is(side, "solid") && DENSITY[type] > DENSITY[diag]) {
            if (this.swap(x, y, x + dir, y + 1)) moved++;
            continue;
          }
          const diag2 = this.get(x - dir, y + 1);
          const side2 = this.get(x - dir, y);
          if (!is(side2, "solid") && DENSITY[type] > DENSITY[diag2]) {
            if (this.swap(x, y, x - dir, y + 1)) moved++;
            continue;
          }
        }

        if (liquid) {
          const dir = Math.random() < 0.5 ? -1 : 1;

          const diag = this.get(x + dir, y);
          if (DENSITY[type] > DENSITY[diag]) {
            if (this.swap(x, y, x + dir, y)) moved++;
            continue;
          }
          const diag2 = this.get(x - dir, y);
          if (DENSITY[type] > DENSITY[diag2]) {
            if (this.swap(x, y, x - dir, y)) moved++;
            continue;
          }
        }

        if (DENSITY[type] > DENSITY[below]) {
          if (this.swap(x, y, x, y + 1)) moved++;
          continue;
        }
      }
    }
    return moved;
  }
}

module.exports = PowderSim;
