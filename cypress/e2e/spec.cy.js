// describe("login", () => {
//   it("logins in", () => {
//     cy.visit("http://localhost:3000/");
//     cy.get(".amplify-button--primary").click();
//   });
// });

// describe("sign in", () => {
//   it("signs in", () => {
//     cy.visit("http://localhost:3000/");
//     cy.findByRole("textbox", { name: /email/i }).type("fegananca@gmail.com");
//     cy.get("#amplify-id-:rc:").type("Fernanda!123");
//     cy.findByRole("button", { name: /sign in/i }).click();
//   });
// });
// describe("media is rendered in the dashboard", () => {
//   it("has pictures", () => {
//     cy.get(".post")
//       .invoke("attr", "id")
//       .should("equal", "e1ee1830-bf73-4cb4-ac5c-0086d556e158");
//   });
// });

describe("Login", () => {
  before(() => {
    cy.signIn();
  });

  after(() => {
    cy.clearLocalStorageSnapshot();
    // cy.clearLocalStorage(); -- not working for permission issues
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  it("should be logged in", () => {
    cy.visit("http://localhost:3000/");
    cy.get(".header").should("be.visible");
  });
});
