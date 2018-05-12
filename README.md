# mosaic-node-generator
A Node module to generate mosaic images.

## Installation 
```sh
npm install mosaic-node-generator --save
yarn add mosaic-node-generator
bower install mosaic-node-generator --save
```
## Usage
### Javascript
```javascript
var mosaic = require('mosaic-node-generator');
var res = mosaic.test('Hey');
```
```sh
Output should be 'You passed in Hey'
```
### TypeScript
```typescript
import { test } from 'mosaic-node-generator';
console.log(test('Hey'))
```
```sh
Output should be 'You passed in Hey'
```
### AMD
```javascript
define(function(require,exports,module){
  var mosaic = require('mosaic-node-generator');
});
```
## Test 
```sh
npm run test
```