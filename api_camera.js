// api_camera.js
export class VideoProcessor {
  constructor(videoSelector, canvasSelector) {
    this.video = document.querySelector(videoSelector);
    this.canvas = document.querySelector(canvasSelector);
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.filter = null;
    this.flipHorizontal = false;
    this.autor = true;
  }

  async start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.video.srcObject = stream;

      this.video.addEventListener('loadedmetadata', () => {
        //this.canvas.width = this.video.videoWidth;
        //this.canvas.height = this.video.videoHeight;
        this.render();
      });
    } catch (err) {
      console.error("Erreur d'accès à la caméra : ", err);
      alert("Errreur caméra !");
    }
  }

  setFilter(filter) {
    this.filter = filter;
  }
  setFlip(state) {
    this.flipHorizontal = state;
  }

  render() {
    requestAnimationFrame(() => this.render());
    if (this.flipHorizontal) {
      this.ctx.save();
      this.ctx.scale(-1, 1); // inverse horizontalement
      this.ctx.drawImage(this.video, -this.canvas.width, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
    } else {
      this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    }
    let frame = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

    if (this.filter) {
      frame = this.filter.apply(frame,  this.canvas);
    }

    this.ctx.putImageData(frame, 0, 0);

   if (this.autor) {
  	const text = "by argentropcher";
  	const padding = 2;
  	this.ctx.font = "9px sans-serif";
  	this.ctx.fillStyle = "white";
  	this.ctx.textAlign = "right";
  	this.ctx.textBaseline = "bottom";
  	this.ctx.fillText(text, this.canvas.width - padding, this.canvas.height - padding);
    }
  }
  // Screen canvas en PNG
  Screen() {
    const image = this.canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = 'capture.png';
    link.click();
  }
  ScreenBox(boxWidth, boxHeight) {
  const centerX = Math.floor(this.canvas.width / 2);
  const centerY = Math.floor(this.canvas.height / 2);
  const startX = Math.max(centerX - Math.floor(boxWidth / 2), 0);
  const startY = Math.max(centerY - Math.floor(boxHeight / 2), 0);

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = boxWidth;
  tempCanvas.height = boxHeight;

  const tempCtx = tempCanvas.getContext('2d');

  tempCtx.drawImage(
    this.canvas,
    startX, startY, boxWidth, boxHeight, // source (dans canvas principal)
    0, 0, boxWidth, boxHeight            // destination (dans canvas temporaire)
  );

  const image = tempCanvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = image;
  link.download = `capture_${boxWidth}x${boxHeight}.png`;
  link.click();
}
}

// --- Filtres ---
export class NoneFilter {
  apply(imageData) {
    return imageData;
  }
}

export class NegativeFilter {
  apply(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];     // R
      data[i + 1] = 255 - data[i + 1]; // G
      data[i + 2] = 255 - data[i + 2]; // B
    }
    return imageData;
  }
}

export class BlackAndWhiteFilter {
  apply(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = data[i + 1] = data[i + 2] = avg;
    }
    return imageData;
  }
}

export class RedFilter {
  apply(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i + 1] = 0;
      data[i + 2] = 0;
    }
    return imageData;
  }
}

export class RedInvertFilter {
  apply(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 0;
      data[i + 2] = 0;
    }
    return imageData;
  }
}

export class GreenFilter {
  apply(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0;
      data[i + 1] = data[ i+1];
      data[i + 2] = 0;
    }
    return imageData;
  }
}

export class GreenInvertFilter {
  apply(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0;
      data[i + 1] = 255-data[ i+1];
      data[i + 2] = 0;
    }
    return imageData;
  }
}

export class BlueFilter {
  apply(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = data[i+2];
    }
    return imageData;
  }
}

export class BlueInvertFilter {
  apply(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 255-data[i+2];
    }
    return imageData;
  }
}

export class ContrastFilter {
  apply(imageData, canvas) {
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let i = (y * width + x) * 4;
        let iRight = (y * width + (x + 1)) * 4;

        const diff =
          Math.abs(data[i] - data[iRight]) +
          Math.abs(data[i + 1] - data[iRight + 1]) +
          Math.abs(data[i + 2] - data[iRight + 2]);

        if (diff > 12) {
          data[i] = 0;
          data[i + 1] = 255;
          data[i + 2] = 0;
        } else {
          data[i] = data[i + 1] = data[i + 2] = 0;
        }
      }
    }
    return imageData;
  }
}

export class MovementFilter {
  constructor() {
    this.oldData = null;
    this.stableData = null;
  }

  apply(imageData, canvas) {
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    if (!this.oldData || !this.stableData) {
      this.oldData = new Uint8ClampedArray(data);
      this.stableData = new Uint8ClampedArray(data);
      return imageData;
    }

    const noiseThreshold = 30;
    const backgroundTolerance = 220;
    const blockSize = 3;
    const movementThreshold = 5;

    for (let y = 0; y < height; y += blockSize) {
      for (let x = 0; x < width; x += blockSize) {
        let diffCount = 0;

        for (let dy = 0; dy < blockSize; dy++) {
          for (let dx = 0; dx < blockSize; dx++) {
            const px = x + dx;
            const py = y + dy;

            if (px >= width || py >= height) continue;

            const i = (py * width + px) * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const rOld = this.oldData[i], gOld = this.oldData[i + 1], bOld = this.oldData[i + 2];
            const rStable = this.stableData[i], gStable = this.stableData[i + 1], bStable = this.stableData[i + 2];

            const diffOld = Math.abs(r - rOld) + Math.abs(g - gOld) + Math.abs(b - bOld);
            const diffStable = Math.abs(r - rStable) + Math.abs(g - gStable) + Math.abs(b - bStable);

            if (diffOld > noiseThreshold && diffStable > backgroundTolerance) {
              diffCount++;
            }

            this.stableData[i] = this.stableData[i] * 0.9 + r * 0.1;
            this.stableData[i + 1] = this.stableData[i + 1] * 0.9 + g * 0.1;
            this.stableData[i + 2] = this.stableData[i + 2] * 0.9 + b * 0.1;
          }
        }

        const color = (diffCount >= movementThreshold) ? 255 : 0;

        for (let dy = 0; dy < blockSize; dy++) {
          for (let dx = 0; dx < blockSize; dx++) {
            const px = x + dx;
            const py = y + dy;
            if (px >= width || py >= height) continue;

            const i = (py * width + px) * 4;
            data[i] = data[i + 1] = data[i + 2] = color;
          }
        }
      }
    }

    this.oldData = new Uint8ClampedArray(data);
    return imageData;
  }
}

export class PointFilter {
  constructor() {
    this.oldData = null;
    this.stableData = null;
  }

  apply(imageData, canvas) {
    const data = imageData.data;
    const datasave = new Uint8ClampedArray(imageData.data);
    const width = canvas.width;
    const height = canvas.height;

    if (!this.oldData || !this.stableData) {
      this.oldData = new Uint8ClampedArray(data);
      this.stableData = new Uint8ClampedArray(data);
      return imageData;
    }

    const noiseThreshold = 30;
    const backgroundTolerance = 220;
    const blockSize = 3;
    const movementThreshold = 5;

    // Détection du mouvement par rapport à l'image précédente
    for (let y = 0; y < height; y += blockSize) {
      for (let x = 0; x < width; x += blockSize) {
        let diffCount = 0;

        for (let dy = 0; dy < blockSize; dy++) {
          for (let dx = 0; dx < blockSize; dx++) {
            const px = x + dx;
            const py = y + dy;

            if (px >= width || py >= height) continue;

            const i = (py * width + px) * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const rOld = this.oldData[i], gOld = this.oldData[i + 1], bOld = this.oldData[i + 2];
            const rStable = this.stableData[i], gStable = this.stableData[i + 1], bStable = this.stableData[i + 2];

            const diffOld = Math.abs(r - rOld) + Math.abs(g - gOld) + Math.abs(b - bOld);
            const diffStable = Math.abs(r - rStable) + Math.abs(g - gStable) + Math.abs(b - bStable);

            if (diffOld > noiseThreshold && diffStable > backgroundTolerance) {
              diffCount++;
            }

            // Mise à jour des données stables
            this.stableData[i] = this.stableData[i] * 0.9 + r * 0.1;
            this.stableData[i + 1] = this.stableData[i + 1] * 0.9 + g * 0.1;
            this.stableData[i + 2] = this.stableData[i + 2] * 0.9 + b * 0.1;
          }
        }

        // Si le mouvement est détecté, marquer cette zone
        const color = (diffCount >= movementThreshold) ? 255 : 0;

        for (let dy = 0; dy < blockSize; dy++) {
          for (let dx = 0; dx < blockSize; dx++) {
            const px = x + dx;
            const py = y + dy;
            if (px >= width || py >= height) continue;

            const i = (py * width + px) * 4;
            data[i] = data[i + 1] = data[i + 2] = color;
          }
        }
      }
    }

    // Recherche des pixels blancs et détection de la zone
    const whiteThreshold = 200;
    let minX = width, minY = height;
    let maxX = 0, maxY = 0;
    let totalWhite = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];

        if (r > whiteThreshold && g > whiteThreshold && b > whiteThreshold) {
          totalWhite++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Si assez de pixels blancs sont trouvés, dessiner le rectangle vert
    if (totalWhite > 100) {
      const boxWidth = maxX - minX;
      const boxHeight = maxY - minY;
      const centerX = minX + boxWidth / 2;
      const centerY = minY + boxHeight / 2;

      // Dessiner le rectangle vert sans modifier les pixels de la caméra
      this.drawGreenBox(data, { x: centerX, y: centerY }, width, height, boxWidth, boxHeight);
    }

    this.oldData = new Uint8ClampedArray(data);

    // Remplacer les pixels noirs et blancs par les pixels d'origine de la caméra
    for (let i = 0; i < data.length; i += 4) {
      // Si un pixel est noir (ou très proche de noir) ou blanc (ou très proche de blanc)
      const r = data[i], g = data[i + 1], b = data[i + 2];
      
      const isWhite = r > whiteThreshold && g > whiteThreshold && b > whiteThreshold;
      const isBlack = r < 30 && g < 30 && b < 30;

      if (isWhite || isBlack) {
        // Remplacer ce pixel par son original de l'image de la caméra
        imageData.data[i] = datasave[i];
        imageData.data[i + 1] = datasave[i + 1];
        imageData.data[i + 2] = datasave[i + 2];
      }
    }


    // Retourner l'image sans modification de la caméra
    return imageData;
  }

  drawGreenBox(data, coords, canvasWidth, canvasHeight, boxWidth = 40, boxHeight = 60) {
    const startX = Math.max(coords.x - boxWidth / 2, 0);
    const startY = Math.max(coords.y - boxHeight / 2, 0);
    const endX = Math.min(coords.x + boxWidth / 2, canvasWidth);
    const endY = Math.min(coords.y + boxHeight / 2, canvasHeight);

    // Dessiner le cadre en vert pixel par pixel (haut et bas)
    for (let x = startX; x < endX; x++) {
      let top = (startY * canvasWidth + x) * 4;
      let bottom = ((endY - 1) * canvasWidth + x) * 4;
      data[top] = 0; data[top + 1] = 255; data[top + 2] = 0; // Vert
      data[bottom] = 0; data[bottom + 1] = 255; data[bottom + 2] = 0;
    }

    // Dessiner les côtés gauche et droit
    for (let y = startY; y < endY; y++) {
      let left = (y * canvasWidth + startX) * 4;
      let right = (y * canvasWidth + (endX - 1)) * 4;
      data[left] = 0; data[left + 1] = 255; data[left + 2] = 0;
      data[right] = 0; data[right + 1] = 255; data[right + 2] = 0;
    }
  }
}

export class GreenBoxFilter {
  constructor(boxWidth, boxHeight) {
    this.boxWidth = boxWidth;
    this.boxHeight = boxHeight;
  }

  apply(imageData, canvas) {
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);

    const startX = Math.max(centerX - this.boxWidth / 2, 0);
    const startY = Math.max(centerY - this.boxHeight / 2, 0);
    const endX = Math.min(centerX + this.boxWidth / 2, width);
    const endY = Math.min(centerY + this.boxHeight / 2, height);

    // Dessiner le cadre en vert (haut et bas)
    for (let x = startX; x < endX; x++) {
      const top = (Math.floor(startY) * width + Math.floor(x)) * 4;
      const bottom = (Math.floor(endY - 1) * width + Math.floor(x)) * 4;

      data[top] = 0; data[top + 1] = 255; data[top + 2] = 0;
      data[bottom] = 0; data[bottom + 1] = 255; data[bottom + 2] = 0;
    }

    // Dessiner les côtés gauche et droit
    for (let y = startY; y < endY; y++) {
      const left = (Math.floor(y) * width + Math.floor(startX)) * 4;
      const right = (Math.floor(y) * width + Math.floor(endX - 1)) * 4;

      data[left] = 0; data[left + 1] = 255; data[left + 2] = 0;
      data[right] = 0; data[right + 1] = 255; data[right + 2] = 0;
    }

    return imageData;
  }
}


export class FaceFilter {
  constructor(templates = []) {
    this.templates = templates; // array d'images HTMLImageElement (masques)
  }

  async loadTemplate(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(img);
    });
  }

  // Main filter
  apply(imageData, canvas) {
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    const data = imageData.data;
    const gray = this.toGrayscale(data, width, height);

    // Parcourir les templates
    for (const template of this.templates) {
      const matches = this.matchTemplate(gray, width, height, template);
      const acceptedMatches = [];
      // Pour chaque match avec score > 60%, dessiner un cadre vert
      for (const match of matches) {
        if (match.score >= 0.6) {
          let tooClose = false;
    for (const accepted of acceptedMatches) {
      if (this.distance(accepted, match) < 100) {
        tooClose = true;
        break;
      }
    }

    if (!tooClose) {
      acceptedMatches.push(match);
      this.drawGreenBox(data, match, width, height, template.width, template.height);
      //console.log('Match accepté :', match);
    }
        }
      }
    }

    return imageData;
  }

  toGrayscale(data, width, height) {
    const gray = new Uint8ClampedArray(width * height);
    for (let i = 0; i < data.length; i += 4) {
      gray[i / 4] =(data[i] + data[i + 1] + data[i + 2]) >> 2;
    }
    return gray;
  }

matchTemplate(imageGray, width, height, templateImg) {
  const tempCanvas = document.createElement('canvas');
  const tW = templateImg.width;
  const tH = templateImg.height;
  tempCanvas.width = tW;
  tempCanvas.height = tH;
  const tCtx = tempCanvas.getContext('2d');
  tCtx.drawImage(templateImg, 0, 0);
  const tData = tCtx.getImageData(0, 0, tW, tH).data;
  const tGray = this.toGrayscale(tData, tW, tH);

  // Calcul rapide : moyenne du template
  const tplMean = this.mean(tGray);

  const results = [];

  for (let y = 0; y < height - tH; y += 10) {
    for (let x = 0; x < width - tW; x += 10) {
      // Récupérer une sous-zone de l’image
      const zone = new Uint8ClampedArray(tW * tH);
      for (let ty = 0; ty < tH; ty++) {
        for (let tx = 0; tx < tW; tx++) {
          zone[ty * tW + tx] = imageGray[(y + ty) * width + (x + tx)];
        }
      }

      const zoneMean = this.mean(zone);

      // Filtrage précoce : si les moyennes sont trop différentes, on skip
      if (Math.abs(zoneMean - tplMean) > 25) continue;

      // Matching pixel à pixel mais avec sous-échantillonnage (1/2)
      let matchPixels = 0;
      const total = Math.ceil(tW / 2) * Math.ceil(tH / 2);

      for (let ty = 0; ty < tH; ty += 2) {
        for (let tx = 0; tx < tW; tx += 2) {
          const imgPixel = imageGray[(y + ty) * width + (x + tx)];
          const tplPixel = tGray[ty * tW + tx];
          if (Math.abs(imgPixel - tplPixel) < 40) matchPixels++;
        }
      }

      const score = matchPixels / total;
      results.push({ x, y, score });
    }
  }

  return results;
}
  
 drawGreenBox(data, coords, canvasWidth, canvasHeight, boxWidth, boxHeight) {
  const startX = Math.max(coords.x, 0);
  const startY = Math.max(coords.y, 0);
  const endX = Math.min(coords.x + boxWidth, canvasWidth);
  const endY = Math.min(coords.y + boxHeight, canvasHeight);

  // Haut et bas
  for (let x = startX; x < endX; x++) {
    const top = (Math.floor(startY) * canvasWidth + Math.floor(x)) * 4;
    const bottom = ((Math.floor(endY) - 1) * canvasWidth + Math.floor(x)) * 4;
    data[top] = 0; data[top + 1] = 255; data[top + 2] = 0;
    data[bottom] = 0; data[bottom + 1] = 255; data[bottom + 2] = 0;
  }

  // Côtés gauche et droit
  for (let y = startY; y < endY; y++) {
    const left = (Math.floor(y) * canvasWidth + Math.floor(startX)) * 4;
    const right = (Math.floor(y) * canvasWidth + Math.floor(endX) - 1) * 4;
    data[left] = 0; data[left + 1] = 255; data[left + 2] = 0;
    data[right] = 0; data[right + 1] = 255; data[right + 2] = 0;
  }
}
distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}
mean(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) sum += arr[i];
  return sum / arr.length;
}
}