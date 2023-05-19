const headDom = document.getElementsByTagName("head")[0];

const scriptDom = document.createElement("script");
scriptDom.src = "b.js";

headDom.append(scriptDom);

scriptDom.onload = function () {
  console.log("b.js onload ");
};

console.log("a 代码执行完成");


// script dom 被插入时候会有异步效果，在所有 JS 代码执行完成之后空闲了 b.js 才会被执行