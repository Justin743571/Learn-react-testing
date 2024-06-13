import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import ProductList from "../../src/components/ProductList";
import { server } from "../mocks/server";
import { http, HttpResponse, delay } from "msw";
import { db } from "../mocks/db";
import { QueryClient, QueryClientProvider } from "react-query";

describe("ProductList", () => {
  const productIds: number[] = [];
  beforeAll(() => {
    [1, 2, 3].forEach(() => {
      const product = db.product.create();
      productIds.push(product.id);
    });
  });
  afterAll(() => {
    db.product.deleteMany({ where: { id: { in: productIds } } });
  });

  const renderProductList = () => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    render(
      <>
        <QueryClientProvider client={client}>
          <ProductList />
        </QueryClientProvider>
      </>
    );
  };

  it("应呈现产品列表", async () => {
    renderProductList()
    const items = await screen.findAllByRole("listitem");
    expect(items.length).toBeGreaterThan(0);
  });

  it("如果没有产品 应呈现no products", async () => {
    server.use(http.get("/products", () => HttpResponse.json([])));

    renderProductList()
    const message = await screen.findByText(/no products/i);
    expect(message).toBeInTheDocument();
  });

  it("出现错误时，应呈现错误信息", async () => {
    server.use(http.get("/products", () => HttpResponse.error()));

    renderProductList()
    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });

  it("如果在获取数据时 应呈现loading文本", async () => {
    server.use(
      http.get("/products", async () => {
        await delay();
        return HttpResponse.json([]);
      })
    );

    renderProductList()

    expect(await screen.findByText(/loading/i)).toBeInTheDocument();
  });

  it("在获取完数据 应呈现去除loading文本", async () => {
    renderProductList()

    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
  });

  it("在获取完数据出现错误 应呈现去除loading文本", async () => {
    server.use(http.get("/products", () => HttpResponse.error()));

    renderProductList()

    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
  });
});
