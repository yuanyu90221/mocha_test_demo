const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

const mongoose = require('mongoose');
const users = require('../lib/users');
const User = require('../lib/models/user');

const sandbox = sinon.sandbox.create();
describe('users', ()=> {
  let findStub;
  let sampleArgs;
  let sampleUser;

  beforeEach(()=>{
    sampleUser = {
      id: 123,
      name: 'foo',
      email: 'foo@mail.com'
    };
    findStub = sandbox.stub(mongoose.Model, 'findById').resolves(sampleUser);
  });

  afterEach(()=>{
    sandbox.restore();
  });

  context('get', () => {
    it('should check for an id', (done)=>{
      users.get(null, (err, result)=>{
        expect(err).to.exist;
        expect(err.message).to.equal('Invalid user id');
        done();
      });
    });

    it('should call findUserById with and return result', (done) => {
      sandbox.restore();
      let stub = sandbox.stub(mongoose.Model, 'findById').yields(null, {name: 'foo'});

      users.get(123, (err, result)=>{
        expect(err).to.not.exist;
        expect(stub).to.have.been.calledOnce;
        expect(stub).to.have.been.calledWith(123);
        expect(result).to.be.a('object');
        expect(result).to.have.property('name').to.equal('foo');
        done();
      });
    });

    it('it should catch error if there is one', (done) => {
      sandbox.restore();
      let stub = sandbox.stub(mongoose.Model, 'findById').yields(new Error('fake'));
      users.get(123, (err, result)=>{
        expect(result).to.not.exist;
        expect(err).to.exist;
        expect(err).to.be.instanceOf(Error);
        expect(stub).to.have.been.calledWith(123);
        expect(err.message).to.equal('fake');
        done();
      });
    });
  })
});