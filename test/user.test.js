const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const rewire = require('rewire');

const mongoose = require('mongoose');
let users = rewire('../lib/users');
const User = require('../lib/models/user');
const mailer = require('../lib/mailer');

const sandbox = sinon.sandbox.create();
describe('users', ()=> {
  let findStub;
  let sampleArgs;
  let sampleUser;
  let deleteStub;
  let mailerStub;

  beforeEach(()=>{
    sampleUser = {
      id: 123,
      name: 'foo',
      email: 'foo@mail.com'
    };
    findStub = sandbox.stub(mongoose.Model, 'findById').resolves(sampleUser);
    deleteStub = sandbox.stub(mongoose.Model, 'remove').resolves('fake_remove_result');
    mailerStub = sandbox.stub(mailer, 'sendWelcomeEmail').resolves('fake_email');
  });

  afterEach(()=>{
    sandbox.restore();
    users = rewire('../lib/users');
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
  });

  context('delete user', ()=> {
    it('should check for an id using return', ()=> {
      return users.delete().then((result)=> {
        throw new Error('unexpected success')
      }).catch((ex)=>{
        expect(ex).to.be.instanceof(Error);
        expect(ex.message).to.equal('Invalid id');
      });
    });

    it('should check for error using eventually', ()=>{
      return expect(users.delete()).to.eventually.to.be.rejectedWith('Invalid id')
    });

    it('should Call User.remove', async()=> {
      let result = await users.delete(123);

      expect(result).to.equal('fake_remove_result');
      expect(deleteStub).to.have.been.calledWith({_id: 123});
    });
  });

  context('create user', ()=> {
    let FakeUserClass, saveStub, result;
    beforeEach(async()=>{
      saveStub = sandbox.stub().resolves(sampleUser);
      FakeUserClass = sandbox.stub().returns({save: saveStub});
    
      users.__set__('User', FakeUserClass);
      result = await users.create(sampleUser);
    });

    it('should reject invalid arguments', async()=>{
      await expect(users.create()).to.eventually.be.rejectedWith('Invalid arguments');
      await expect(users.create({name: 'foo'})).to.eventually.be.rejectedWith('Invalid arguments');
      await expect(users.create({email: 'foo@bar.com'})).to.eventually.be.rejectedWith('Invalid arguments');
    });

    it('shold call User with new', ()=>{
      expect(FakeUserClass).to.have.been.calledWithNew;
      expect(FakeUserClass).to.have.been.calledWith(sampleUser);
    });

    it('should save the user', ()=> {
      expect(saveStub).to.have.been.called;
    });
    
    it('should call mailer with email and name', ()=>{
      expect(mailerStub).to.have.been.calledWith(sampleUser.email, sampleUser.name);
    });

    it('should reject errors', async()=>{
      saveStub.rejects(new Error('fake'));

      await expect(users.create(sampleUser)).to.eventually.be.rejectedWith('fake');
    });
  });
});