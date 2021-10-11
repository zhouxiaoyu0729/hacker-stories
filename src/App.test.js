import { render, screen } from "@testing-library/react";
import renderer from "react-test-renderer";
import App, { Item, List, SearchForm, InputWithLabel } from "./App";
import axios from "axios";
// test("renders learn react link", () => {
//   render(<App />);
//   const linkElement = screen.getByText(/learn react/i);
//   expect(linkElement).toBeInTheDocument();
// });

// describe("something truthy", () => {
//   it("true to be true", () => {
//     expect(true).toBe(true);
//   });
// });
jest.mock("axios");

// item组件单元测试
describe("Item", () => {
  const item = {
    title: "React",
    url: "https://reactjs.org/",
    author: "Jordan Walke",
    num_comments: 3,
    points: 4,
    ObjectID: 0,
  };
  let component;
  const handleRemoveItem = jest.fn();

  beforeEach(() => {
    component = renderer.create(
      <Item item={item} onRemoveItem={handleRemoveItem} />
    );
  });
  it("renders all properties", () => {
    expect(component.root.findAllByType("a")[0].props.href).toEqual(
      "https://reactjs.org/"
    );
    expect(
      component.root.findAllByProps({ children: "Jordan Walke" }).length
    ).toEqual(1);
  });

  it("calls onRemoveItem on button click", () => {
    component.root.findByType("button").props.onClick();
    expect(handleRemoveItem).toHaveBeenCalledTimes(1); //调用的次数
    expect(handleRemoveItem).toHaveBeenCalledWith(item); //是否被调用
    expect(component.root.findAllByType(Item).length).toEqual(1); //Item的子节点个数
  });
});

// list组件
describe("List", () => {
  const list = [
    {
      title: "React",
      url: "https://reactjs.org/",
      author: "Jordan Walke",
      num_comments: 3,
      points: 4,
      ObjectID: 0,
    },
    {
      title: "React",
      url: "https://reactjs.org/",
      author: "Jordan Walke",
      num_comments: 3,
      points: 4,
      ObjectID: 0,
    },
  ];
  it("renderer two items", () => {
    const component = renderer.create(<List list={list} />);
    expect(component.root.findAllByType(Item).length).toEqual(2);
  });
});

// 搜索组件
describe("SearchForm", () => {
  let component;
  const SearchFormProps = {
    searchTerm: "React",
    onSearchInput: jest.fn(),
    onSearchSubmit: jest.fn(),
  };

  beforeEach(() => {
    component = renderer.create(<SearchForm {...SearchFormProps} />);
  });
  it("renders the input frild with its value", () => {
    const value = component.root.findByType("input").props.value;
    expect(value).toEqual("React");
  });

  // 集成测试 SearchForm 组件和 InputWithLabel 组件
  it("changes the input field", () => {
    const pseudoEvent = { targrt: "Redux" };
    component.root.findByType("input").props.onChange(pseudoEvent);
    expect(SearchFormProps.onSearchInput).toHaveBeenCalledTimes(1);
    expect(SearchFormProps.onSearchInput).toHaveBeenLastCalledWith(pseudoEvent);
  });

  it("submits the form", () => {
    const pseudoEvent = {};
    component.root.findByType("form").props.onSubmit(pseudoEvent);
    expect(SearchFormProps.onSearchSubmit).toHaveBeenCalledTimes(1);
    expect(SearchFormProps.onSearchSubmit).toHaveBeenCalledWith(pseudoEvent);
  });
});

// mock数据进行测试
// describe("App", () => {
//   it("succeeds fetching data with a list", async () => {
//     const list = [
//       {
//         title: "React",
//         url: "https://reactjs.org/",
//         author: "Jordan Walke",
//         num_comments: 3,
//         points: 4,
//         objectID: 0,
//       },
//       {
//         title: "Redux",
//         url: "https://redux.js.org/",
//         author: "Dan Abramov, Andrew Clark",
//         num_comments: 2,
//         points: 5,
//         objectID: 1,
//       },
//     ];
//     let component;
//     const promise = Promise.resolve({
//       data: {
//         hits: list,
//       },
//     });

//     axios.get.mockImplementationOnce(() => promise);

//     await renderer.act(async () => {
//       component = renderer.create(<App />);
//     });

//     expect(component.root.findByType(List).props.list).toEqual(list);
    
//   });
// });
