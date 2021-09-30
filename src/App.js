import "./App.css";
import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  memo,
  useMemo
} from "react";
import axios from "axios"; //导入axios
import styled from "styled-components";
// import { ReactComponent as Check } from './check.svg';

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query=";

const StyledContainer = styled.div`
  height: 100vw;
  padding: 20px;
  background: #83a4d4;
  background: linear-gradient(to left, #b6fbff, #83a4d4);
  color: #171212;
`;

const StyledHeadlinePrimary = styled.h1`
  font-size: 48px;
  font-weight: 300;
  letter-spacing: 2px;
`;

const getSumComments = (stories) => {
  console.log("C");
  return stories.data.reduce((result, value) => result + value.num_comments, 0);
};

function App() {
  const [searchTerm, setSearchTerm] = useSemiPersistentState("search", ""); //自定义hook
  // useReducer状态管理
  const [stories, dispatchStories] = useReducer(storiesReducer, {
    data: [],
    isLoading: false,
    isError: false,
  });
  const sumCommnts = useMemo(()=>getSumComments(stories),[stories]) ;

  const [url, setUrl] = useState(`${API_ENDPOINT}${searchTerm}`);
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    localStorage.setItem("search", searchTerm);
  }, [searchTerm]);

  const onSearchSubmit = (event) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);
    event.preventDefault();
  };

  const handleFetchStories = useCallback(async () => {
    dispatchStories({
      type: "STORIES_FETCH_INIT",
    });

    try {
      const res = await axios.get(url);
      dispatchStories({
        type: "STORIES_FETCH_SUCCESS",
        payload: res.data.hits,
      });
    } catch {
      dispatchStories({
        type: "STORIES_FETCH_FAILURE",
      });
    }
  }, [url]);

  useEffect(() => {
    // 仅在组件首次渲染后运行
    handleFetchStories();
  }, [handleFetchStories]);

  const handleRemoveStory = useCallback((item) => {
    dispatchStories({
      type: "REMOVE_STORY",
      payload: item,
    });
  }, []);

  return (
    <StyledContainer>
      <StyledHeadlinePrimary>
        My Hacker Stories with {sumCommnts}
      </StyledHeadlinePrimary>
      <SearchForm
        searchTerm={searchTerm}
        onSearchSubmit={onSearchSubmit}
        onSearchInput={handleSearch}
      />
      {/* <Search search={searchTerm} onSearch={handleSearch} /> */}
      <hr />
      {stories.isError && <p>-----something is wrong-------</p>}
      {stories.isLoading ? (
        <p>---------Loading---------</p>
      ) : (
        <List list={stories.data} handleRemoveStory={handleRemoveStory} />
      )}
    </StyledContainer>
  );
}

const SearchForm = ({ searchTerm, onSearchInput, onSearchSubmit }) => {
  return (
    <form onSubmit={onSearchSubmit}>
      <InputWithLabel
        id="search"
        value={searchTerm}
        isFocused
        onInputChange={onSearchInput}
      >
        <strong>Search:</strong>
      </InputWithLabel>
      <button type="submit" disabled={!searchTerm}>
        搜索
      </button>
    </form>
  );
};

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
};
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
        <div>
          <a href="https://www.freepik.com" title="免费皮克">
            免费皮克
          </a>
        </div>
      </button>
    </div>
  );
};

const List = memo(({ list, handleRemoveStory }) => {
  return list.map((item) => (
    <Item key={item.objectID} item={item} onRemoveItem={handleRemoveStory} />
  ));
});

// const Search = ({ search, onSearch }) => {
//   return (
//     <div>
//       <label htmlFor="search">Search: </label>
//       <input id="search" type="text" value={search} onChange={onSearch} />
//     </div>
//   );
// };

// 自定义组件
const useSemiPersistentState = (key, initialState) => {
  const isMounted = useRef(false);
  const [value, setValue] = useState(localStorage.getItem(key) || initialState);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      localStorage.setItem(key, value);
    }
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
