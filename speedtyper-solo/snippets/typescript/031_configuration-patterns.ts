{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "outDir": "./dist"
  }
}

{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}

interface User {
  id: number;
  name: string;
}
declare const currentUser: User;

declare module "external-lib" {
  export function init(config: object): void;
}

/// <reference types="node" />
const process = require('process');
console.log(process.env.NODE_ENV);