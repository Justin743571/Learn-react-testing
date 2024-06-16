import { render, screen } from "@testing-library/react";
import ProductForm from "../../src/components/ProductForm";
import { Category, Product } from "../../src/entities";
import AllProviders from "../AllProviders";
import { db } from "../mocks/db";
import userEvent from "@testing-library/user-event";

describe("ProductForm", () => {
  let category: Category;
  beforeAll(() => {
    category = db.category.create();
  });
  afterAll(() => {
    db.category.delete({ where: { id: { equals: category.id } } });
  });

  const renderComponent = (product?: Product) => {
    render(<ProductForm product={product} onSubmit={vi.fn()} />, {
      wrapper: AllProviders,
    });

    return {
      waitforFormToLoad: async () => {
        await screen.findByRole("form");
        return {
          nameInput: screen.getByPlaceholderText(/name/i),
          priceInput: screen.getByPlaceholderText(/price/i),
          categoryInput: screen.getByRole("combobox", { name: /category/i }),
          submitButton: screen.getByRole("button"),
        };
      },
    };
  };

  it("应呈现输入字段", async () => {
    const { waitforFormToLoad } = renderComponent();

    const { nameInput, priceInput, categoryInput } = await waitforFormToLoad();

    expect(nameInput).toBeInTheDocument();
    expect(priceInput).toBeInTheDocument();
    expect(categoryInput).toBeInTheDocument();
  });

  it("编辑产品时应填充表单字段", async () => {
    const product: Product = {
      id: 1,
      name: "milk",
      price: 10,
      categoryId: category.id,
    };
    const { waitforFormToLoad } = renderComponent(product);

    const { nameInput, priceInput, categoryInput } = await waitforFormToLoad();

    expect(nameInput).toHaveValue(product.name);
    expect(priceInput).toHaveValue(product.price.toString());
    expect(categoryInput).toHaveTextContent(category.name);
  });

  it("应将焦点放在名称字段上", async () => {
    const { waitforFormToLoad } = renderComponent();

    const { nameInput } = await waitforFormToLoad();
    expect(nameInput).toHaveFocus();
  });
  it.each([
    { scenario: "missing", errorMessage: /required/i },
    {
      scenario: "longer than 255 characters",
      name: "a".repeat(256),
      errorMessage: /255/,
    },
  ])(
    "should display an error if name is $scenario",
    async ({ name, errorMessage }) => {
      const { waitforFormToLoad } = renderComponent();

      const form = await waitforFormToLoad();
      const user = userEvent.setup();
      if (name !== undefined) await user.type(form.nameInput, name);
      await user.type(form.priceInput, "10");
      await user.click(form.categoryInput);
      const options = screen.getAllByRole("option");
      await user.click(options[0]);
      await user.click(form.submitButton);

      const error = screen.getByRole("alert");
      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent(errorMessage);
    }
  );
});
