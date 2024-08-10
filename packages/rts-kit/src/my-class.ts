export class MyClass {
  hello(): string {
    try {
      // если удалось прочитать __dirname, значит мы в CommonJS. Если нет, то в ESModule
      // в ESModule нет привычных nodejs разработчикам констант __dirname, __filename, ...
      // https://nodejs.org/api/esm.html - раздел "Differences between ES modules and CommonJS"
      const dir = __dirname;
      console.log(dir);
      return "CommonJS 2";
    } catch (e) {
      return "ESModule 2";
    }
  }
}
