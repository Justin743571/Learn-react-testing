import { render, screen } from "@testing-library/react";
import ProductList from "../../src/components/ProductList";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";

describe("ProductList", () => {
  it("应呈现产品列表", async () => {
    render(<ProductList />);
    const items = await screen.findAllByRole("listitem");
    expect(items.length).toBeGreaterThan(0);
  });
  it("如果没有产品 应呈现no products", async() => {
    server.use(http.get("/products", () => HttpResponse.json([])));

    render(<ProductList />);
    const message = await screen.findByText(/no products/i)
    expect(message).toBeInTheDocument();
  });
});
