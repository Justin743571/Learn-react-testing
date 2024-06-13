import { render, screen } from "@testing-library/react";
import OrderStatusSelector from "../../src/components/OrderStatusSelector";
import { Theme } from "@radix-ui/themes";
import userEvent from "@testing-library/user-event";

describe("OrderStatusSelector", () => {
    const renderOrderStatusSelector = () =>{
        const onChange = vi.fn();
        render(
            <Theme>
              <OrderStatusSelector onChange={onChange} />
            </Theme>
          );
        return{
            trigger:screen.getByRole("combobox"),
            user:userEvent.setup(),
            getOptions:() =>screen.findAllByRole("option"),
            getOption:(label:RegExp) => screen.findByRole("option",{name:label}),
            onChange,
        }
    }

  it("作为默认值应呈现New", () => {
    const {trigger} = renderOrderStatusSelector();

    expect(trigger).toHaveTextContent(/new/i);
  });

  it("应呈现全部正确状态", async() => {
    const {trigger,user,getOptions} = renderOrderStatusSelector();

    await user.click(trigger);

    const options = await getOptions();
    expect(options).toHaveLength(3)

    const labels = options.map(option => option.textContent);
    expect(labels).toEqual(["New","Processed","Fulfilled"])
  });

  it('当选择Processed时 应调用processed的 onChange', async() => {
    const {user,trigger,onChange,getOption} = renderOrderStatusSelector();
    await user.click(trigger);

    const option = await getOption(/processed/i);
    await user.click(option);


    expect(onChange).toHaveBeenCalledWith("processed");
  })
  
  it('当选择Fulfilled时 应调用fulfilled的 onChange', async() => {
    const {user,trigger,onChange,getOption} = renderOrderStatusSelector();
    await user.click(trigger);

    const option = await getOption(/fulfilled/i);
    await user.click(option);


    expect(onChange).toHaveBeenCalledWith("fulfilled");
  })

  it('当选择New时 应调用new的 onChange', async() => {
    const {user,trigger,onChange,getOption} = renderOrderStatusSelector();
    
    await user.click(trigger);
    await user.click(await getOption(/fulfilled/i));

    await user.click(trigger)
    await user.click(await getOption(/new/i));


    expect(onChange).toHaveBeenCalledWith("new");
  })
});
