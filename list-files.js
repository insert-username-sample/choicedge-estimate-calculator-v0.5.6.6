const fs = require('fs');
const path = require('path');

function findFileCaseInsensitive(dir, filename) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      const result = findFileCaseInsensitive(filePath, filename);
      if (result) {
        return result;
      }
    } else if (file.toLowerCase() === filename.toLowerCase()) {
      return filePath;
    }
  }
  return null;
}

const filePath = findFileCaseInsensitive('./src', 'main.tsx');

if (filePath) {
  console.log(filePath);
} else {
  console.log('File not found');
}
