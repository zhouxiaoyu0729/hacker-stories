import "./App.css";
import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  useMemo,
} from "react";
import axios from "axios"; //导入axios
import styled from "styled-components";
import List from "./List";
import SearchForm from "./SearchForm";
import RemberHistory from "./RemenberHistory";
import { uniq } from "lodash";
const API_BASE = "https://hn.algolia.com/api/v1";
const API_SEARCH = "/search";
const PARAM_SEARCH = "query=";
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
// 通用处理只显示最后5个搜索记录  当前输入的不展示为按钮
const getLastSearches = (urls) => urls.slice(-6).slice(0, -1);
const extractSearchTerm = (url) =>
  url.substring(url.lastIndexOf("?") + 1, url.lastIndexOf("&"));

const getSumComments = (stories) => {
  return stories.data.reduce((result, value) => result + value.num_comments, 0);
};

function App() {
  const [searchTerm, setSearchTerm] = useSemiPersistentState("search", ""); //自定义hook
  // useReducer状态管理
  const [stories, dispatchStories] = useReducer(storiesReducer, {
    data: [],
    page: 0,
    isLoading: false,
    isError: false,
  });
  const sumCommnts = useMemo(() => getSumComments(stories), [stories]);
  const [url, setUrl] = useState([
    `${API_BASE}${API_SEARCH}?${PARAM_SEARCH}${searchTerm}`,
  ]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  //截取多余的数据拿到最后5个搜索记录  去重 当前搜索的是数据不展示为按钮
  const lastSerachs = uniq(
    getLastSearches(url).map((url) => extractSearchTerm(url))
  );
  useEffect(() => {
    localStorage.setItem("search", searchTerm);
  }, [searchTerm]);

  // 提取公共代码
  const handleUrl = (val) => {
    const currentUrl = `${API_BASE}${API_SEARCH}?${PARAM_SEARCH}${val}`;
    const arr = url.concat(currentUrl);
    setUrl(arr);
  };
  const onSearchSubmit = (event) => {
    handleUrl(searchTerm);
    event.preventDefault();
  };

  const handleLastSearch = (val) => {
    // 再次搜索
    setSearchTerm(val);
    handleUrl(val);
  };

  const handleFetchStories = useCallback(async () => {
    dispatchStories({
      type: "STORIES_FETCH_INIT",
    });

    try {
      const lastUrl = url[url.length - 1];
      const res = await axios.get(lastUrl + `&page=${stories.page}`);
      dispatchStories({
        type: "STORIES_FETCH_SUCCESS",
        payload: {
          list: res.data.hits,
          page: res.data.page,
        },
      });
    } catch {
      dispatchStories({
        type: "STORIES_FETCH_FAILURE",
      });
    }
  }, [url, stories.page]);

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

  const getAllList = () => {
    dispatchStories({
      type: "ADD_PAGE",
    });
  };

  return (
    <StyledContainer>
      <button type="button" onClick={getAllList}>
        获取更多
      </button>
      <StyledHeadlinePrimary>
        My Hacker Stories with {sumCommnts}
      </StyledHeadlinePrimary>
      <SearchForm
        searchTerm={searchTerm}
        onSearchSubmit={onSearchSubmit}
        onSearchInput={handleSearch}
      />
      {/* 记住上一次搜索记录 */}
      <RemberHistory
        list={lastSerachs}
        getSearchRecords={(val) => handleLastSearch(val)}
      />

      <hr />
      {stories.isError && <p>-----something is wrong-------</p>}
      {stories.isLoading ? (
        <span>---------Loading---------</span>
      ) : (
        <List list={stories.data} handleRemoveStory={handleRemoveStory} />
      )}
    </StyledContainer>
  );
}

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
        data: state.data.concat(action.payload.list),
        page: action.payload.page,
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
    case "ADD_PAGE":
      return {
        ...state,
        page: state.page++,
      };
    default:
      throw new Error();
  }
};

export default App;
