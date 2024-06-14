import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import BrowseProducts from "../../src/pages/BrowseProductsPage";
import { Theme } from "@radix-ui/themes";
import userEvent from "@testing-library/user-event";
import { db } from "../mocks/db";
import { Category, Product } from "../../src/entities";
import { CartProvider } from "../../src/providers/CartProvider";
import { simulateDelay, simulateError } from "../utils";

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
    return {
      getProductsSkeleton: () =>
        screen.queryByRole("progressbar", { name: /products/i }),
      getCategoriesSkeleton: () =>
        screen.queryByRole("progressbar", { name: /categories/i }),
      getCategoriesComboBox: () => screen.queryByRole("combobox"),
    };
  };

  it("如果正在获取Categories数据 应呈现加载骨架", () => {
    simulateDelay("/categories");

    const { getCategoriesSkeleton } = renderBrowseProducts();

    expect(getCategoriesSkeleton()).toBeInTheDocument();
  });

  it("如果获取完Categories数据 应呈现隐藏加载骨架", async () => {
    const { getCategoriesSkeleton } = renderBrowseProducts();

    await waitForElementToBeRemoved(getCategoriesSkeleton);
  });

  it("如果正在获取Products数据 应呈现加载骨架", () => {
    simulateDelay("/products");

    const { getProductsSkeleton } = renderBrowseProducts();

    expect(getProductsSkeleton()).toBeInTheDocument();
  });

  it("如果获取完Products数据 应呈现隐藏加载骨架", async () => {
    const { getProductsSkeleton } = renderBrowseProducts();

    await waitForElementToBeRemoved(getProductsSkeleton);
  });

  it("如果在获取categories数据失败 不应呈现categories的东西", async () => {
    simulateError("/categories");

    const { getCategoriesSkeleton, getCategoriesComboBox } =
      renderBrowseProducts();

    await waitForElementToBeRemoved(getCategoriesSkeleton);

    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    expect(getCategoriesComboBox()).not.toBeInTheDocument();
  });

  it("如果在获取product数据失败 不应呈现product的东西", async () => {
    simulateError("/products");

    const { getProductsSkeleton } = renderBrowseProducts();

    await waitForElementToBeRemoved(getProductsSkeleton);

    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it("应渲染categories", async () => {
    const { getCategoriesSkeleton, getCategoriesComboBox } =
      renderBrowseProducts();

    await waitForElementToBeRemoved(getCategoriesSkeleton);

    const combobox = getCategoriesComboBox();
    expect(combobox).toBeInTheDocument();
    expect(combobox).toHaveTextContent(/category/i);

    const user = userEvent.setup();
    await user.click(combobox!);

    expect(screen.getByRole("option", { name: /all/i })).toBeInTheDocument();
    categories.forEach((category) => {
      expect(
        screen.getByRole("option", { name: category.name })
      ).toBeInTheDocument();
    });
  });

  it("应渲染products", async () => {
    const { getProductsSkeleton } = renderBrowseProducts();

    await waitForElementToBeRemoved(getProductsSkeleton);

    products.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    });
  });
});
