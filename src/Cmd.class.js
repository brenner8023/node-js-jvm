// 命令行工具类
class Cmd {
  constructor(program) {
    this.jreOption = program.jrepath; // jre目录         
    this.cpOption = program.classpath; // 指定用户类路径
    this.className = program.args[0]; // 指定主类
    this.args = program.args.slice(1); // 传入的字符串数组
    this.version = program.version(); // 版本号
  }
  printClasspath() {
    console.log(`classpath:${this.cpOption} class:${this.className} args:[${this.args}]`);
  }
  printArgs() {
    console.log(`[${this.args.join(' ')}]`);
  }
}
module.exports = Cmd;