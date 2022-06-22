describe("Navigation", () => {
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

  it("should renders dashboard", () => {
    cy.visit("http://localhost:3000/");
    cy.get("#postlist").should("be.visible");
  });

  it("should renders all posts", () => {
    let prevMedia;
    cy.get("#e1ee1830-bf73-4cb4-ac5c-0086d556e158").then(
      ($media) => (prevMedia = $media.text())
    );
  });

  it("should navigates to New Post page", () => {
    cy.get('[href="/newPost"] > svg').click();
  });

  it("should matches search location", () => {
    cy.findByRole("textbox", { name: /location search/i }).type("barcelona");
    cy.get(".amplify-field-group__outer-end > .amplify-button").click();
    cy.get(".locationsearchresults").should("be.visible");
    cy.get(".locationsearchresults > svg").click();
    cy.get("#selectedlocation").should("be.visible");
  });

  it("should adds date", () => {
    cy.findByLabelText(/date of photo/i).type("2022-06-22");
    cy.findByRole("textbox", { name: /background story contentlabel/i }).type(
      "This is a test"
    );
  });

  it("should uploads image", () => {
    const filepath = "../fixtures/Foto em 18-06-2022 às 17.55.jpg";
    cy.get("#fileupload").attachFile(filepath);
    cy.findByRole("img").isFixtureImage("Foto em 18-06-2022 às 17.55.jpg");
    cy.get("#submitbutton").click();
  });
});
