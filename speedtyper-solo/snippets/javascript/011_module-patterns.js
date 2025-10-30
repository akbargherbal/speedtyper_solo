const calculator = (() => {
  let result = 0;
  const add = (x) => result += x;
  const subtract = (x) => result -= x;
  const getResult = () => result;
  return { add, subtract, getResult };
})();

const Logger = (() => {
  let instance;
  function createLogger() {
    return {
      log: (message) => console.log(message)
    };
  }
  return {
    getInstance: () => {
      if (!instance) {
        instance = createLogger();
      }
      return instance;
    }
  };
})();

function createProduct(name, price) {
  return {
    name,
    price,
    describe() {
      return `${this.name} costs $${this.price}`;
    }
  };
}