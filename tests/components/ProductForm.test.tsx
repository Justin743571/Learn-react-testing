import { render, screen } from "@testing-library/react";
import ProductForm from "../../src/components/ProductForm";
import { Category, Product } from "../../src/entities";
import AllProviders from "../AllProviders";
import { db } from "../mocks/db";

describe("ProductForm", () => {
  let category: Category;
  beforeAll(() => {
    category = db.category.create();
  });
  afterAll(() => {
    db.category.delete({ where: { id: { equals: category.id } } });
  });
  it("应呈现输入字段", async () => {
    render(<ProductForm onSubmit={vi.fn()} />, { wrapper: AllProviders });

    await screen.findByRole("form");

    expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/price/i)).toBeInTheDocument();

    expect(
      screen.getByRole("combobox", { name: /category/i })
    ).toBeInTheDocument();
  });
  it("编辑产品时应填充表单字段", async () => {
    const product: Product = {
      id: 1,
      name: "milk",
      price: 10,
      categoryId: category.id,
    };
    render(<ProductForm product={product} onSubmit={vi.fn()} />, {
      wrapper: AllProviders,
    });

    await screen.findByRole("form");

    expect(screen.getByPlaceholderText(/name/i)).toHaveValue(product.name);
    expect(screen.getByPlaceholderText(/price/i)).toHaveValue(
      product.price.toString()
    );

    expect(
      screen.getByRole("combobox", { name: /category/i })
    ).toHaveTextContent(category.name);
  });
});
