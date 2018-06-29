/* eslint-disable no-console */
/* global it describe Nightmare before after */
module.exports.test = function foo(uiTestCtx) {
  describe('Module test: users:type_barcode', function bar() {
    const { config, helpers: { login, openApp, logout }, meta: { testVersion } } = uiTestCtx;

    myConfig = config.nightmare;
    myConfig.typeInterval = 0;  // type in without delay like a barcode scanner
    const nightmare = new Nightmare(myConfig);

    this.timeout(Number(config.test_timeout));

    const barcode = 'abcdefghijklmnopqrstuvwxyz1234567890';
    const barcodeMatches = function (expected) {
      return document.querySelector('#adduser_barcode').value == expected;
    }

    describe('Login > Type Barcode > Clear Barcode > Insert Barcode > Logout\n', () => {
      before((done) => {
        login(nightmare, config, done); // logs in with the default admin credentials
      });
      after((done) => {
        logout(nightmare, config, done);
      });
      it('should open app and find version tag', (done) => {
        nightmare
          .use(openApp(nightmare, config, done, 'users', testVersion))
          .then(result => result)
          .catch(done);
      });
      it('should open new user form', (done) => {
        nightmare
          .wait('#clickable-newuser')
          .click('#clickable-newuser')
          .wait('#adduser_barcode')
          .wait(1000)
          .then(done)
          .catch(done);
      });
      it('should type 36 barcode characters', (done) => {
        nightmare
          .type('#adduser_barcode', barcode)
          .wait(barcodeMatches, barcode)
          .then(done)
          .catch(done);
      });
      it('should clear barcode field', (done) => {
        nightmare
          .type('#adduser_barcode', '')
          .wait(barcodeMatches, '')
          .then(done)
          .catch(done);
      });
      it('should insert 36 barcode characters', (done) => {
        nightmare
          .insert('#adduser_barcode', 'a')
          .insert('#adduser_barcode', 'b')
          .insert('#adduser_barcode', 'c')
          .insert('#adduser_barcode', 'd')
          .insert('#adduser_barcode', 'e')
          .insert('#adduser_barcode', 'f')
          .insert('#adduser_barcode', 'g')
          .insert('#adduser_barcode', 'h')
          .insert('#adduser_barcode', 'i')
          .insert('#adduser_barcode', 'j')
          .insert('#adduser_barcode', 'k')
          .insert('#adduser_barcode', 'l')
          .insert('#adduser_barcode', 'm')
          .insert('#adduser_barcode', 'n')
          .insert('#adduser_barcode', 'o')
          .insert('#adduser_barcode', 'p')
          .insert('#adduser_barcode', 'q')
          .insert('#adduser_barcode', 'r')
          .insert('#adduser_barcode', 's')
          .insert('#adduser_barcode', 't')
          .insert('#adduser_barcode', 'u')
          .insert('#adduser_barcode', 'v')
          .insert('#adduser_barcode', 'w')
          .insert('#adduser_barcode', 'x')
          .insert('#adduser_barcode', 'y')
          .insert('#adduser_barcode', 'z')
          .insert('#adduser_barcode', '1')
          .insert('#adduser_barcode', '2')
          .insert('#adduser_barcode', '3')
          .insert('#adduser_barcode', '4')
          .insert('#adduser_barcode', '5')
          .insert('#adduser_barcode', '6')
          .insert('#adduser_barcode', '7')
          .insert('#adduser_barcode', '8')
          .insert('#adduser_barcode', '9')
          .insert('#adduser_barcode', '0')
          .wait(barcodeMatches, barcode)
          .then(done)
          .catch(done);
      });
    });
  });
};
