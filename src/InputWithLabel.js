import React from "react";
const InputWithLabel = ({
  id,
  type = "text",
  value,
  isFocused,
  onInputChange,
  children,
}) => {
  return (
    <div>
      <label htmlFor="search">{children} </label>
      <input id={id} type={type} value={value} onChange={onInputChange} />
    </div>
  );
}
export default InputWithLabel;
