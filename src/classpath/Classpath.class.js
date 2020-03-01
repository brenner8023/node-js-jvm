let path = require("path"),
  fs = require("fs"),
  {Entry, StarEntry} = require("./Entry.class");

class Classpath {
  constructor() {
    this.bootClasspath = null; // 启动类路径
    this.extClasspath = null; // 扩展类路径
    this.userClasspath = null; // 用户类路径
  }

  // 解析类路径方法
  static parseClasspath(jreOption, cpOption) {
    let cp = new Classpath();
    cp.parseBootAndExtClasspath(jreOption);
    cp.parseUserClasspath(cpOption);
    return cp;
  }
  // 获取jre路径
  static getJrePath(jreOption) {
    if (jreOption != null && fs.existsSync(jreOption)) {
      return jreOption;
    }
    if(fs.existsSync("./jre")) return "./jre";
    let javaHome = process.env.JAVA_HOME;
    if (javaHome != null) {
      return path.join(javaHome, "jre");
    }
    throw new Error("Can not find jre folder!")
  }
  // 解析启动类和扩展类路径
  parseBootAndExtClasspath(jreOption) {
    let jrePath,
      jreLibPath,
      jreExtPath;
    jrePath = Classpath.getJrePath(jreOption);
    jreLibPath = path.join(jrePath, "lib", "*");
    jreExtPath = path.join(jrePath, "lib", "ext", "*");
    this.bootClasspath = new StarEntry(jreLibPath);
    this.extClasspath = new StarEntry(jreExtPath);
  }
  parseUserClasspath(cpOption) {
    if (!cpOption) return ".";
    this.userClasspath = Entry.makeEntry(cpOption);
  }

  loadClass(classname) {
    let result = {
      data: null,
      entry: null,
      error: null
    };
    classname = classname + ".class";
    if (this.bootClasspath != null) {
      result = this.bootClasspath.searchAndLoadClass(classname);
      if (this.extClasspath != null && !result.data) {
        result = this.extClasspath.searchAndLoadClass(classname);
        if (this.userClasspath != null && !result.data) {
          return this.userClasspath.searchAndLoadClass(classname);
        }
      }
    }
    return {
      data: result.data,
      entry: result.entry,
      error: result.error
    };
  }

  entryToString() {
    if (this.userClasspath) {
      return this.userClasspath.entryToString();
    } else {
      return ".";
    }
  }
}

module.exports = Classpath;