import { render, screen } from "@testing-library/react";
import ProductDetail from "../../src/components/ProductDetail";
import { products } from "../mocks/data";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";

describe("ProductDetail", () => {
  it("应呈现具体产品名和价格", async () => {
    render(<ProductDetail productId={1} />);

    expect(await screen.findByText(new RegExp(products[0].name)));
    expect(await screen.findByText(new RegExp(products[0].price.toString())));
  });
  it('如果产品没有找到 应该呈现一段文字', async() => {
    server.use(http.get("products/1",()=> HttpResponse.json(null)))
    render(<ProductDetail productId={1}/>) 

    expect(await screen.findByText(/not found/i)).toBeInTheDocument();
  })

  it('如果接收一个无效productId 应该呈现error', async() => {
    render(<ProductDetail productId={0}/>) 

    expect(await screen.findByText(/invalid/i)).toBeInTheDocument();
  })
});
