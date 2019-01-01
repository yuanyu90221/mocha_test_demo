const assert = require('assert');
describe('file to be tested', () => {
  context('function to be tested', () => {
    before(()=>{
      console.log("========before=======");
    });
    after(()=>{
      console.log("========after=======");
    });

    beforeEach(()=>{
      console.log(`======before-each=====`);
    });
    afterEach(()=>{
      console.log(`======after-each=====`);
    });

    it('should do something', () => {
      assert.equal(1,1);
    }); 

    it('should do something else', () => {
      try {
        assert.deepEqual({name: 'joe'}, {name: 'joe'})
      } catch (e) {
        console.error(JSON.parse(JSON.stringify(e)));
        // throw e;
      }
    });
    
    it('this is a pending test');
  })
});