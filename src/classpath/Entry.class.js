const path = require("path"),
  fs = require("fs"),
  AdmZip = require("adm-zip");

// 类路径基类
class Entry {
  // 寻找和加载class文件的方法
  searchAndLoadClass(classname) {}

  entryToString() {}

  // 根据不同的参数类型创建不同的实例
  static makeEntry(mypath) {
    if (mypath.includes(";")) return new CompositeEntry(mypath);
    else if (mypath.endsWith("*")) return new StarEntry(mypath);
    else if (/((\.jar)|(\.zip))$/i.test(mypath)) return new ZipEntry(mypath);
    else return new DirEntry(mypath);
  }
}

// 表示zip或者jar文件形式的类路径
class ZipEntry extends Entry {
  constructor(mypath) {
    super();
    this.absDir = mypath;
  }

  searchAndLoadClass(classname) {
    let zip = AdmZip(this.absDir),
      error = null,
      data = null;
    for(let item of zip.getEntries()) {
      if(!item.isDirectory) {
        if (item.entryName == classname) {
          try {
            data = zip.readFile(item);
            return {error: null, entry: this, data};
          } catch(err) {
            return {error: err, entry: null, data: null};
          }
        }
      }
    }
    return {
      error: `class not found:${classname}`,
      entry: null,
      data: null
    };
  }

  entryToString() {
    return this.absDir;
  }
}

// 表示多个类路径的情况
class CompositeEntry extends Entry {
  constructor(path) {
    super();
    this.listOfEntry = [];

    if (path.includes(";")) {
      path.split(";").forEach(item => {
        this.listOfEntry.push(Entry.makeEntry(item));
      });
    }
  }

  searchAndLoadClass(classname) {
    for(let entry of this.listOfEntry) {
      let result = entry.searchAndLoadClass(classname);
      if (!result.error) {
        return {
          data: result.data,
          entry: result.entry,
          error: null
        }
      }
    }
    return {
      data: null,
      entry: null,
      error: `class not found:${classname}`
    };
  }

  entryToString() {
    return this.listOfEntry.map(item => {
      item.entryToString();
    }).join(";");
  }
}

// 表示目录类似/a/b/*的类路径
class StarEntry extends CompositeEntry {
  constructor(path) {
    super(path);
    let baseDir = path.slice(0, path.length - 1);
    StarEntry.readAndAddFile(baseDir, this.listOfEntry);
  }

  // 读取目录下的文件并添加到this.listOfEntry
  static readAndAddFile(mypath, listOfEntry) {
    let listOfPath = fs.readdirSync(mypath);
    listOfPath.forEach(item => {
      let info = fs.statSync(mypath + "/" + item);
      if (info.isDirectory()) {
        StarEntry.readAndAddFile(mypath + "/" + item, listOfEntry);
      } else if (/((\.jar)|(\.zip))$/i.test(item)) {
        listOfEntry[listOfEntry.length] = new ZipEntry(path.join(mypath, item));
      } else {
        listOfEntry[listOfEntry.length] = new DirEntry(path.join(mypath, item));
      }
    });
  }
}

// 表示普通目录形式的类路径
class DirEntry extends Entry {
  constructor(path) {
    super();
    this.absDir = path;
  }

  searchAndLoadClass(classname) {
    let filename = path.join(this.absDir, classname),
      data = null,
      error = null;
    try {
      data = fs.readFileSync(filename);
      return {
        error,
        entry: this,
        data
      };
    } catch(err) {
      return {
        error: err,
        entry: this,
        data: null
      };
    }
    
  }

  entryToString() {
    return this.absDir;
  }
}

module.exports = {
  Entry,
  StarEntry
};
