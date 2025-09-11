const authMiddleware = require("../middleware/is-auth");
const expect = require("chai").expect;
// make sure to throw error when there's no authorization header
it("it should throw an error if no authorization header is present", () => {
  // define request object
  const req = {
    get: function (headerName) {
      // to simulate no authorization header
      return null;
    },
  };
  /*
no logic for response & next here 
=> pass prepared reference 
*/
  expect(authMiddleware.bind(this, req, {}, () => {})).to.throw("Authorization header missing");
});
