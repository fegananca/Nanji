import "@testing-library/cypress/add-commands";
import "cypress-localstorage-commands";
import "cypress-file-upload";

const Auth = require("aws-amplify").Auth;

const username = Cypress.env("EMAIL");
const password = Cypress.env("password");
const userPoolId = Cypress.env("userPoolId");
const clientId = Cypress.env("clientId");

const awsconfig = {
  aws_user_pools_id: userPoolId,
  aws_user_pools_web_client_id: clientId,
};

Auth.configure(awsconfig);

Cypress.Commands.add("signIn", () => {
  cy.then(() => Auth.signIn(username, password)).then((cognitoUser) => {
    const idToken = cognitoUser.signInUserSession.idToken.jwtToken;
    const accessToken = cognitoUser.signInUserSession.accessToken.jwtToken;

    const makeKey = (name) =>
      `CognitoIdentityServiceProvider.${cognitoUser.pool.clientId}.${cognitoUser.username}.${name}`;

    cy.setLocalStorage(makeKey("accessToken"), accessToken);
    cy.setLocalStorage(makeKey("idToken"), idToken);
    cy.setLocalStorage(
      `CognitoIdentityServiceProvider.${cognitoUser.pool.clientId}.LastAuthUser`,
      cognitoUser.username
    );
  });
  cy.saveLocalStorage();
});

Cypress.Commands.add(
  "isFixtureImage",
  {
    prevSubject: true,
  },
  (subject, fixtureImage) => {
    cy.wrap(subject)
      .should(([img]) => {
        expect(img.complete).to.be.true;
      })
      .then(([img]) => {
        cy.fixture(fixtureImage).then((content) => {
          //create an in memory image version to compare its size with the one is rendering on the browser
          let fixtureImage = new Image();
          fixtureImage.src = `data:image/jpeg;base64,${content}`;
          // create a Promise to wait until the image is load and tell cypress to start the test. That's because the onload callback is asyncronous
          return new Promise((resolve) => {
            //image that renders in the browser. Once is loaded we set the in memory height and width to compare
            fixtureImage.onload = () => {
              //expect the image to have its height and width (if the image do not display we know by not having its width and height)
              expect(img.naturalWidth).to.equal(fixtureImage.naturalWidth);
              expect(img.naturalHeight).to.equal(fixtureImage.naturalHeight);
              resolve();
            };
          });
        });
      });
  }
);
