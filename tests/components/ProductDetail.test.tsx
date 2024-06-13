import { render, screen, waitForElementToBeRemoved } from "@testing-library/react";
import ProductDetail from "../../src/components/ProductDetail";
import { server } from "../mocks/server";
import { delay, http, HttpResponse } from "msw";
import { db } from "../mocks/db";

describe("ProductDetail", () => {
  let productId: number;
  beforeAll(() => {
    const product = db.product.create();
    productId = product.id;
  });
  afterAll(() => {
    db.product.delete({ where: { id: { equals: productId } } });
  });
  it("应呈现具体产品名和价格", async () => {
    const product = db.product.findFirst({where:{id:{equals:productId}}})
    render(<ProductDetail productId={productId} />);

    expect(await screen.findByText(new RegExp(product!.name)));
    expect(await screen.findByText(new RegExp(product!.price.toString())));
  });
  it("如果产品没有找到 应该呈现一段文字", async () => {
    server.use(http.get("products/"+productId, () => HttpResponse.json(null)));
    render(<ProductDetail productId={productId} />);

    expect(await screen.findByText(/not found/i)).toBeInTheDocument();
  });

  it("如果接收一个无效productId 应该呈现error", async () => {
    render(<ProductDetail productId={0} />);

    expect(await screen.findByText(/invalid/i)).toBeInTheDocument();
  });

  it('如果出现错误 应呈现错误信息', async() => {
    server.use(http.get("products/"+productId, () => HttpResponse.error()));
    render(<ProductDetail productId={productId} />);

    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  })

  it('如果数据正在加载 应呈现加载文本', async() => {
    server.use(http.get("products/"+productId, async() => {
      await delay()
      return HttpResponse.json(null)}));

      render(<ProductDetail productId={productId} />);
    
      expect(await screen.findByText(/loading/i))
  })
  it('如果数据加载完成 loading文本应去除', async() => {
    render(<ProductDetail productId={productId} />);

    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i))
  })
  it('如果数据加载错误 loading文本应去除', async() => {
    server.use(http.get("products/"+productId, () => HttpResponse.error()));
    render(<ProductDetail productId={productId} />);

    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i))
  })
});
