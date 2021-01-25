import React from "react";
import Feed from "../components/Feed";
import WritePost from "../components/WritePost";

const HomePage = () => {
  return (
    <div>
      <h1>YASM: Yet Another Social Media</h1>
      <WritePost />
      <Feed />
    </div>
  );
};

export default HomePage;
