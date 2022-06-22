import { Search } from "./search-comp";
import { render, screen } from "@testing-library/react";

test("search a friend", () => {
  render(<Search />);
  screen.debug();
});
// describe("search a friend", () => {
//   it("renders the search friend", () => {
//     const { getByTestId } = render(<Search />);
//     const input = getByTestId("searchresults");
//     expect(input).toBeTruthy();
//   });
// });
