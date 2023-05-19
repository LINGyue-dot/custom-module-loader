(function (global) {
  function CustomLoader() {}

  var publicPath = "";

  // 模块信息
  var module = {};
  // loading 队列，用于保证调用时机
  var loadingQueue = [];

  // 初始化时候设置 publicPath 以及加载入口文件
  CustomLoader.init = function () {
    var scriptDom = document.getElementsByTagName("script")[0];
    // 获取 scripts/main.js 中的 scripts
    publicPath = scriptDom.dataset.main.split("/").slice(0, -1).join("/");

    // 获取 scripts/main.js 中的 main
    var inputFile = scriptDom.dataset.main
      .split("/")
      .slice(-1)[0]
      .replace(".js", "");
    CustomLoader.loadJS(inputFile, null);
  };

  CustomLoader.getCurrentSrc = function () {
    return document.currentScript.getAttribute("src");
  };

  CustomLoader.loadJS = function (fileName) {
    const src = CustomLoader.genPath(fileName);

    // 已经加载过了
    if (module[src]) {
      CustomLoader.checkLoading();
      return;
    }

    const scriptDom = document.createElement("script");

    scriptDom.src = src;
    scriptDom.type = "text/javascript";

    scriptDom.onload = function () {
      CustomLoader.checkLoading();
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
      //  加载状态，1 为 loading 、 2 为加载成功
      state: 1,
      deps,
      callback,
      exports: null,
    };
    if (deps.length === 0) {
      module[id].exports = callback();
      module[id].state = 2;
    }
    loadingQueue.unshift(module[id]);
    deps.map((dep) => {
      CustomLoader.loadJS(dep);
    });
  };

  // 检测当前 loading 队列里的是否该执行 callback
  CustomLoader.checkLoading = function () {
    for (let i = 0; i < loadingQueue.length; i++) {
      var item = loadingQueue[i];
      if (CustomLoader.checkDepsReady(item)) {
        // 如果依赖都已经加载完成了
        item.state = 2;
        item.exports = item.callback(
          ...item.deps.map((dep) => module[CustomLoader.genPath(dep)].exports)
        );
        loadingQueue.splice(i, 1);
        i--;
        CustomLoader.checkLoading();
      }
    }
  };

  CustomLoader.checkDepsReady = function (item) {
    return (
      item.deps.length === 0 ||
      item.deps.every(
        (dep) =>
          module[CustomLoader.genPath(dep)] &&
          module[CustomLoader.genPath(dep)].state === 2
      )
    );
  };

  CustomLoader.genPath = function (fileName) {
    return publicPath + "/" + fileName + ".js";
  };

  CustomLoader.require = function (deps, callback) {
    var id = CustomLoader.getCurrentSrc();
    module[id] = {
      id,
      state: 1,
      deps,
      callback,
      exports: null,
    };
    if (deps.length === 0) {
      module[id].exports = null;
      module[id].state = 2;
    }
    loadingQueue.unshift(module[id]);
    deps.map((dep) => {
      CustomLoader.loadJS(dep);
    });
  };

  global.require = CustomLoader.require;
  global.define = CustomLoader.define;
  CustomLoader.init();
})(window);
