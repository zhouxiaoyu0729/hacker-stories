import React, { memo, useState } from "react";
import { orderBy } from "lodash";

// 升序降序排序
const List = memo(({ list, handleRemoveStory }) => {
  const [sort, setSort] = useState({
    sortKey: "NONE",
    isReverse: "desc",
  });
  const SOPTS = {
    NONE: (list) => list,
    TITLE: (list) => orderBy(list, "title", sort.isReverse),
    AUTHOR: (list) => orderBy(list, "author", sort.isReverse),
    COMMENT: (list) => orderBy(list, "num_comments", sort.isReverse),
    POINT: (list) => orderBy(list, "points", sort.isReverse),
  };

  const handleSort = (value) => {
    sort.isReverse === "desc"
      ? setSort({ ...sort, sortKey: value, isReverse: "asc" })
      : setSort({ ...sort, sortKey: value, isReverse: "desc" });
  };

  const sortFunction = SOPTS[sort.sortKey];
  const sortedList = sortFunction(list);

  return (
    <>
      <div style={{ display: "flex" }}>
        <div style={{ width: "40%" }}>
          <button type="button" onClick={() => handleSort("TITLE")}>
            Title
          </button>
        </div>
        <div style={{ width: "30%" }}>
          <button type="button" onClick={() => handleSort("AUTHOR")}>
            Author
          </button>
        </div>
        <div style={{ width: "10%" }}>
          <button type="button" onClick={() => handleSort("COMMENT")}>
            Comments
          </button>
        </div>
        <div style={{ width: "10%" }}>
          <button type="button" onClick={() => handleSort("POINT")}>
            Points
          </button>
        </div>
        <div style={{ width: "10%" }}>
          <span>Actions</span>
        </div>
      </div>
      {sortedList.map((item) => (
        <Item
          key={item.objectID}
          item={item}
          onRemoveItem={handleRemoveStory}
        />
      ))}
    </>
  );
});
const Item = ({ item, onRemoveItem }) => {
  return (
    <>
      <div style={{ display: "flex" }} key={item.objectID}>
        <span style={{ width: "40%" }}>
          <a href={item.url}>{item.title}</a>
        </span>
        <span style={{ width: "30%" }}>{item.author}</span>
        <span style={{ width: "10%" }}>{item.num_comments}</span>
        <span style={{ width: "10%" }}>{item.points}</span>
        <span style={{ width: "10%" }}>
          <button type="button" onClick={() => onRemoveItem(item)}>
            Dissmiss
          </button>
        </span>
      </div>
    </>
  );
};

export default List;
