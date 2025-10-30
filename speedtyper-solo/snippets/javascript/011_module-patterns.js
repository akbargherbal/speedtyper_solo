// PATTERN: Module Patterns

const calculator = (() => {
  let result = 0;
  const add = (x) => result += x;
  const subtract = (x) => result -= x;
  const getResult = () => result;
  return { add, subtract, getResult };
})();

// PATTERN: Module Patterns

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

// PATTERN: Module Patterns

function createProduct(name, price) {
  return {
    name,
    price,
    describe() {
      return `${this.name} costs $${this.price}`;
    }
  };
}