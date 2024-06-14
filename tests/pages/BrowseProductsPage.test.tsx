import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { server } from "../mocks/server";
import { delay, http, HttpResponse } from "msw";
import BrowseProducts from "../../src/pages/BrowseProductsPage";
import { Theme } from "@radix-ui/themes";
import userEvent from "@testing-library/user-event";
import { db } from "../mocks/db";
import { Category, Product } from "../../src/entities";
import { CartProvider } from "../../src/providers/CartProvider";

describe("BrowseProductsPage", () => {
  const categories: Category[] = [];
  const products: Product[] = [];
  beforeAll(() => {
    [1, 2].forEach((item) => {
      categories.push(db.category.create({ name: "Category" + item }));
      products.push(db.product.create());
    });
  });
  afterAll(() => {
    const categoriesId = categories.map((c) => c.id);
    db.category.deleteMany({ where: { id: { in: categoriesId } } });

    const productId = products.map((p) => p.id);
    db.product.deleteMany({ where: { id: { in: productId } } });
  });
  const renderBrowseProducts = () => {
    render(
      <CartProvider>
        <Theme>
          <BrowseProducts />
        </Theme>
      </CartProvider>
    );
  };

  it("如果正在获取Categories数据 应呈现加载骨架", () => {
    server.use(
      http.get("/categories", async () => {
        await delay();
        return HttpResponse.json([]);
      })
    );

    renderBrowseProducts();

    expect(
      screen.getByRole("progressbar", { name: /categories/i })
    ).toBeInTheDocument();
  });

  it("如果获取完Categories数据 应呈现隐藏加载骨架", async () => {
    renderBrowseProducts();

    await waitForElementToBeRemoved(() =>
      screen.queryByRole("progressbar", { name: /categories/i })
    );
  });

  it("如果正在获取Products数据 应呈现加载骨架", () => {
    server.use(
      http.get("/products", async () => {
        await delay();
        return HttpResponse.json([]);
      })
    );

    renderBrowseProducts();

    expect(
      screen.getByRole("progressbar", { name: /products/i })
    ).toBeInTheDocument();
  });

  it("如果获取完Products数据 应呈现隐藏加载骨架", async () => {
    renderBrowseProducts();

    await waitForElementToBeRemoved(() =>
      screen.queryByRole("progressbar", { name: /products/i })
    );
  });

  it("如果在获取categories数据失败 不应呈现categories的东西", async () => {
    server.use(http.get("/categories", () => HttpResponse.error()));

    renderBrowseProducts();

    await waitForElementToBeRemoved(() =>
      screen.queryByRole("progressbar", { name: /categories/i })
    );

    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: /category/i })
    ).not.toBeInTheDocument();
  });

  it("如果在获取product数据失败 不应呈现product的东西", async () => {
    server.use(http.get("/products", () => HttpResponse.error()));

    renderBrowseProducts();

    await waitForElementToBeRemoved(() =>
      screen.queryByRole("progressbar", { name: /products/i })
    );

    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it("应渲染categories", async () => {
    renderBrowseProducts();
    const combobox = await screen.findByRole("combobox");

    expect(combobox).toBeInTheDocument();
    expect(combobox).toHaveTextContent(/category/i);

    const user = userEvent.setup();
    await user.click(combobox);

    expect(screen.getByRole("option", { name: /all/i })).toBeInTheDocument();
    categories.forEach((category) => {
      expect(
        screen.getByRole("option", { name: category.name })
      ).toBeInTheDocument();
    });
  });

  it("应渲染products", async () => {
    renderBrowseProducts();

    await waitForElementToBeRemoved(() =>
      screen.queryByRole("progressbar", { name: /products/i })
    );

    products.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    });
  });
});
