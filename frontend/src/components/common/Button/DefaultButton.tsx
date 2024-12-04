import { IconType } from "react-icons";

interface ButtonProps {
  text: string;
  type: "gray" | "green";
  icon?: IconType;
  onClick: () => void;
}

const DefaultButton = ({ text, type, icon: Icon, onClick }: ButtonProps) => {
  const buttonColor =
    type === "gray"
      ? "bg-gray-200 text-gray-black"
      : "bg-green-200 text-gray-white";

  return (
    <button
      className={`w-full h-12 flex flex-row items-center justify-center gap-2 rounded-custom-m text-semibold-r ${buttonColor} hover:opacity-80`}
      onClick={onClick}
    >
      {Icon ? <Icon /> : null}
      {text}
    </button>
  );
};

export default DefaultButton;
