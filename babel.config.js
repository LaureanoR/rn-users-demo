module.exports = function (api) {
  const isTest = api.env("test");
  return {
    presets: ["babel-preset-expo"],
    // Jest corre en CommonJS y no soporta `import()`; Metro sí. El plugin solo se aplica
    // en tests, para que la carga diferida del fixture se pueda probar sin tocar el código.
    plugins: isTest ? ["dynamic-import-node"] : [],
  };
};
