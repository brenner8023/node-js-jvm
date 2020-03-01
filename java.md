# 自己动手实现Java虚拟机
## 组合模式
组合模式，又称整体-部分模式，将一组相似的对象组合成树形结构，使得用户对单个对象和组合对象的使用具有一致性。
```js
class MacorCommand {
  constructor() {
    this.commandList = [];
  }
  add(command) {
    this.commandList.push(command);
  }
  execute() {
    this.commandList.forEach(item => {
      item.execute();
    });
  }
}

// 调用
let c1, c2, c3;
c1 = {
  execute() {
    console.log("打开空调");
  }
};
c2 = {
  execute() {
    console.log("打开电视");
  }
};
c3 = {
  execute() {
    console.log("打开音响");
  }
}
let mc1 = new MacorCommand();
mc1.add(c1);
mc1.add(c2);

let mc2 = new MacorCommand();
mc2.add(c3);
mc2.add(mc1);

mc2.execute();
```

## Java虚拟机的工作
> 启动Java应用程序的过程：先启动Java虚拟机，然后加载主类，最后调用主类的main方法。

Java虚拟机的工作是运行Java应用程序，Java应用程序需要一个入口点，这个入口点就是主类的main方法。如果一个类包含main方法，这个类就可以用来启动Java应用程序，我们把这个类叫做主类。最简单的HelloWorld程序如下
```java
public class HelloWorld {
  public static void main(String[] args) {
    System.out.println("Hello, world!");
  }
}
```
加载HelloWorld类之前，首先要加载它的超类，也就是`java.lang.Object`。在调用main方法之前，因为虚拟机需要准备参数数组，所以需要加载`java.lang.String`和`java.lang.String[]`类。把字符串打印到控制台还需要加载`java.lang.System`类。

## 类路径
Oracle的Java虚拟机实现是根据类路径来搜索类。按照搜索的先后顺序，类路径可以分为三种：
1. 启动类路径
2. 扩展类路径
3. 用户类路径

说明：
- 启动类路径默认对应jre\lib目录，Java标准库（大部分在rt.jar里）位于该路径。
- 扩展类路径默认对应jre\lib\ext目录，使用Java扩展机制的类位于这个路径。
- 用户自己实现的类，以及第三方类库则位于用户类路径。用户类路径的默认值是当前目录，可以通过给java命令传递`--classpath`选项修改用户类路径

