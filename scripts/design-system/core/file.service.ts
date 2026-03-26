import fs from 'fs';

export class FileService {
  public static writeIfChanged(filePath: string, content: string): void {
    if (fs.existsSync(filePath)) {
      const existing = fs.readFileSync(filePath, 'utf8');

      if (existing === content) {
        return; // no changes
      }
    }

    fs.writeFileSync(filePath, content);
  }
}
