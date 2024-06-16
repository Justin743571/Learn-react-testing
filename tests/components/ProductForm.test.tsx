import { render, screen } from "@testing-library/react";
import ProductForm from "../../src/components/ProductForm";
import AllProviders from "../AllProviders";

describe("ProductForm", () => {
  it("应呈现输入字段", async () => {
    render(<ProductForm onSubmit={vi.fn()} />, { wrapper: AllProviders });

    await screen.findByRole("form");

    expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/price/i)).toBeInTheDocument();
  });
});
