import Button from "../Button.tsx";

export default {
  title: "Components/Button",
  component: Button,
  argTypes: {
    backgroundColor: { control: "color" },
  },
};

const Template = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  primary: true,
  label: "Button",
};
