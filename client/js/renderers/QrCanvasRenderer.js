export class QrCanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Не вдалося завантажити зображення."));
      image.src = src;
    });
  }

  roundRect(ctx, x, y, width, height, radius) {
    const safeRadius = Math.min(radius, width / 2, height / 2);

    ctx.beginPath();
    ctx.moveTo(x + safeRadius, y);
    ctx.lineTo(x + width - safeRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
    ctx.lineTo(x + width, y + height - safeRadius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
    ctx.lineTo(x + safeRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
    ctx.lineTo(x, y + safeRadius);
    ctx.quadraticCurveTo(x, y, x + safeRadius, y);
    ctx.closePath();
  }

  async drawLogo(logoDataUrl, qrSize) {
    if (!logoDataUrl) return;

    const ctx = this.canvas.getContext("2d");
    const logoImage = await this.loadImage(logoDataUrl);

    const logoSize = Math.round(qrSize * 0.16);
    const x = Math.round((qrSize - logoSize) / 2);
    const y = Math.round((qrSize - logoSize) / 2);

    const padding = Math.round(logoSize * 0.18);
    const bgX = x - padding;
    const bgY = y - padding;
    const bgSize = logoSize + padding * 2;

    ctx.save();

    ctx.fillStyle = "#ffffff";
    this.roundRect(ctx, bgX, bgY, bgSize, bgSize, Math.round(bgSize * 0.2));
    ctx.fill();

    this.roundRect(ctx, x, y, logoSize, logoSize, Math.round(logoSize * 0.18));
    ctx.clip();
    ctx.drawImage(logoImage, x, y, logoSize, logoSize);

    ctx.restore();
  }

  async render(config) {
    const { url, darkColor, lightColor, size, margin, logoDataUrl } = config;

    return new Promise((resolve, reject) => {
      QRCode.toDataURL(
        url,
        {
          width: size,
          margin,
          errorCorrectionLevel: "H",
          color: { dark: darkColor, light: lightColor },
        },
        async (error, dataUrl) => {
          if (error) {
            reject(new Error("Не вдалося згенерувати QR-код."));
            return;
          }

          try {
            const qrImage = await this.loadImage(dataUrl);

            this.canvas.width = size;
            this.canvas.height = size;

            const ctx = this.canvas.getContext("2d");
            ctx.clearRect(0, 0, size, size);
            ctx.drawImage(qrImage, 0, 0, size, size);

            if (logoDataUrl) {
              await this.drawLogo(logoDataUrl, size);
            }

            resolve();
          } catch {
            reject(new Error("Не вдалося підготувати QR-код."));
          }
        }
      );
    });
  }

  clear() {
    const ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.width = 0;
    this.canvas.height = 0;
  }
}
