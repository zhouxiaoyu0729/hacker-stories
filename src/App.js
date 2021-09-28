import "./App.css";
import React, { useEffect, useReducer, useState } from "react";

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query=";

function App() {
  const [searchTerm, setSearchTerm] = useSemiPersistentState("search", ""); //自定义hook
  // useReducer状态管理
  const [stories, dispatchStories] = useReducer(storiesReducer, {
    data: [],
    isLoading: false,
    isError: false,
  });

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };



  useEffect(() => {
    localStorage.setItem("search", searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    // 仅在组件首次渲染后运行

    // if(!searchTerm) return;
    dispatchStories({
      type: "STORIES_FETCH_INIT",
    });
    fetch(`${API_ENDPOINT}${searchTerm}`)
      .then((response) => response.json())
      .then((result) => {
        dispatchStories({
          type: "STORIES_FETCH_SUCCESS",
          payload: result.hits,
        });
      })
      .catch(() => {
        dispatchStories({
          type: "STORIES_FETCH_FAILURE",
        });
      });
  }, [searchTerm]);

  const handleRemoveStory = (item) => {
    dispatchStories({
      type: "REMOVE_STORY",
      payload: item,
    });
  };

  return (
    <div>
      <h1>My Hacker Stories</h1>

      <Search search={searchTerm} onSearch={handleSearch} />
      <hr />
      {stories.isError && <p>-----something is wrong-------</p>}
      {stories.isLoading ? (
        <p>---------Loading---------</p>
      ) : (
        <List list={stories.data} handleRemoveStory={handleRemoveStory} />
      )}
    </div>
  );
}

const Item = ({ item, onRemoveItem }) => {
 
  return (
    <div key={item.objectID}>
      <span>
        <a href={item.url}>{item.title}</a>
      </span>
      <span>{item.author}</span>
      <span>{item.num_comments}</span>
      <span>{item.points}</span>
      <button type="button" onClick={() => onRemoveItem(item)}>
        内敛函数处理2
      </button>
    </div>
  );
};

const List = ({ list, handleRemoveStory }) => {
  return list.map((item) => (
    <Item key={item.objectID} item={item} onRemoveItem={handleRemoveStory} />
  ));
};

const Search = ({ search, onSearch }) => {
  return (
    <div>
      <label htmlFor="search">Search: </label>
      <input id="search" type="text" value={search} onChange={onSearch} />
    </div>
  );
};

// 自定义组件
const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );
  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);
  return [value, setValue];
};


const storiesReducer = (state, action) => {
  switch (action.type) {
    case "STORIES_FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "STORIES_FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "STORIES_FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case "STORIES_FETCH_ERROR":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case "REMOVE_STORY":
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.objectID !== story.objectID
        ),
      };
    default:
      throw new Error();
  }
};

export default App;
