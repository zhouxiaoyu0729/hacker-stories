import React from "react";

// 通用处理只显示最后5个搜索记录  当前输入的不展示为按钮
const RemenberHistory = ({ list, getSearchRecords }) => {
  return (
    <div>
      <strong>Last Searches:</strong>
      {list.length &&
        list.map((item, index) => {
          return (
            <button onClick={() => getSearchRecords(item)} key={index}>
              {item}
            </button>
          );
        })}
    </div>
  );
};

export default RemenberHistory;
