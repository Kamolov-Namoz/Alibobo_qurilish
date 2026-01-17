// Alternative image processor using Jimp
const Jimp = require('jimp');
const fs = require('fs').promises;
const path = require('path');

const imageProcessor = {
  isAvailable: () => true,

  async create(input) {
    const image = await Jimp.read(input);
    
    return {
      resize: (width, height) => {
        image.resize(width, height);
        return imageProcessor.create(image);
      },
      
      quality: (quality) => {
        image.quality(quality);
        return imageProcessor.create(image);
      },
      
      toBuffer: async () => {
        return await image.getBufferAsync(Jimp.MIME_JPEG);
      },
      
      toFile: async (outputPath) => {
        const dir = path.dirname(outputPath);
        await fs.mkdir(dir, { recursive: true });
        await image.writeAsync(outputPath);
        return { path: outputPath, processed: true };
      }
    };
  },

  async processBuffer(buffer, options = {}) {
    const image = await Jimp.read(buffer);
    
    if (options.resize) {
      image.resize(options.resize.width, options.resize.height);
    }
    
    if (options.quality) {
      image.quality(options.quality);
    }
    
    return await image.getBufferAsync(Jimp.MIME_JPEG);
  }
};

module.exports = imageProcessor;
