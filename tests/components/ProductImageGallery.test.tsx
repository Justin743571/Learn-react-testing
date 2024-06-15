import { render, screen } from "@testing-library/react";
import ProductImageGallery from "../../src/components/ProductImageGallery";

describe("ProductImageGallery", () => {
  it("如果给一个空数组,应该不渲染", () => {
    const { container } = render(<ProductImageGallery imageUrls={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
  it("应该渲染图像列表", () => {
    const imageUrls = ["asgas", "sfasfa", "svdfsfd"];
    render(<ProductImageGallery imageUrls={imageUrls} />);
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(3);
    imageUrls.forEach((url,index) =>{
        expect(images[index]).toHaveAttribute("src",url)
    })
  });
  
});
