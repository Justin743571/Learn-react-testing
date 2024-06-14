import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { server } from "../mocks/server";
import { delay, http, HttpResponse } from "msw";
import BrowseProducts from "../../src/pages/BrowseProductsPage";
import { Theme } from "@radix-ui/themes";

describe("BrowseProductsPage", () => {
  const renderBrowseProducts = () => {
    render(
      <Theme>
        <BrowseProducts />
      </Theme>
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
});
