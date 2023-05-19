/**
 * 1. 获取 scripts 标签，管理 引入顺序
 * 2. 获取 data-main ，引入文件入口
 * 3. require 以及 define 都是全局函数
 *
 * requirejs 中的 require 和 define 有点区别
 * define 有定义一个模块，可以在回调函数中 return 数据方法供其他模块使用
 * require 只是加载依赖并执行，并没有 return 出去数据方法
 */

// 先不考虑循环依赖等特殊
// 只考虑加载本地文件，看作所有代码串型执行
// 执行逻辑就是先把当前代码执行完成之后，才会再执行新插入的 script 标签
// 

/**
 * 1. 如何获取 basePublic 路径信息？
 */
(function (global) {
  function CustomLoader() {}

  var publicPath = "";

  // 模块信息
  var module = {};

  // 初始化时候设置 publicPath 以及加载入口文件
  CustomLoader.init = function () {
    var scriptDom = document.getElementsByTagName("script")[0];
    console.log(scriptDom.dataset.main);
    publicPath = scriptDom.dataset.main.split("/").slice(0, -1).join("/");

    var inputFile = scriptDom.dataset.main
      .split("/")
      .slice(-1)[0]
      .replace(".js", "");
    CustomLoader.loadPublicJs(inputFile, null);
  };

  CustomLoader.getCurrentSrc = function () {
    return document.currentScript.getAttribute("src");
  };

  // 加载 public 下的 JS 文件
  CustomLoader.loadPublicJs = function (fileName, callback) {
    const src = publicPath + "/" + fileName + ".js";
    // 已经加载过了
    if (module[src]) {
      callback();
      return;
    }

    const scriptDom = document.createElement("script");

    scriptDom.src = src;
    scriptDom.type = "text/javascript";

    scriptDom.onload = function () {
      callback && callback();
    };
    scriptDom.onerror = function (e) {
      console.log(e);
    };

    const headDom = document.getElementsByTagName("head")[0];
    headDom.appendChild(scriptDom);
  };

  CustomLoader.define = function (deps, callback) {
    var id = CustomLoader.getCurrentSrc();
    module[id] = {
      id,
      //  加载状态，1 为 loading 2 为加载成功
      state: 1,
      deps,
      callback,
      exports: null,
    };
    if (deps.length === 0) {
      module[id].exports = callback();
      module[id].state = 2;
      return;
    }

    var len = 0;
    deps.map((dep) => {
      CustomLoader.loadPublicJs(dep, function () {
        len++;
        if (len === deps.length) {
          // 完成所有加载
          var params = deps.map(
            (dep) => module[publicPath + "/" + dep + ".js"].exports
          );
          module[id].exports = callback(...params);
          module[id].state = 2;
        }
      });
    });
  };

  CustomLoader.require = function (deps, callback) {
    var id = CustomLoader.getCurrentSrc();
    module[id] = {
      id,
      //  加载状态，1 为 loading 2 为加载成功
      state: 1,
      deps,
      callback,
      exports: null,
    };
    if (deps.length === 0) {
      callback();
      module[id].state = 2;
      return;
    }

    var len = 0;
    deps.map((dep) => {
      CustomLoader.loadPublicJs(dep, function () {

        len++;
        if (len === deps.length) {
          // 完成所有加载
          var params = deps.map(
            (d) => module[publicPath + "/" + d + ".js"].exports
          );
          // 问题就是：cjs 执行后就会被调用，而不是 a.js b.js 完成之后调用
          // 如何处理依赖递归问题
          console.log(JSON.stringify(module))
          callback(...params);
          module[id].state = 2;
        }
      });
    });
  };

  global.require = CustomLoader.require;
  global.define = CustomLoader.define;
  CustomLoader.init();
})(window);
