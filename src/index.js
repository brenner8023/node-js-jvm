const program = require("commander"),
  Cmd = require("./Cmd.class"),
  Classpath = require("./classpath/Classpath.class");

function startJVM(cmd) {
  let classpath,
    result,
    classname;
  classpath = Classpath.parseClasspath(cmd.jreOption, cmd.cpOption);
  console.log(`classpath: ${classpath.entryToString()} class: ${cmd.className} args: ${cmd.args}`);
  classname = cmd.className.replace(/\./g, "/");
  result = classpath.loadClass(classname);
  if (result.error != null) {
    console.log(result.error);
    console.log(`Could not find or load main class ${cmd.className}`);
    return;
  }

  console.log(`class data: ${result.data}`);
}

function main() {
  program
    .version("0.0.1")
    .usage("[options] class [args...]")
    .option("--cp, --classpath [value]", "指定用户类路径")
    .option("--jp, --jrepath [value]", "指定jre目录") // node index.js --jrepath "D:\Program Files\java\jre" java.lang.Object
    .parse(process.argv);

  startJVM(new Cmd(program));
}
main();