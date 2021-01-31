import React from "react";
import Feed from "../components/Feed";
import WritePost from "../components/WritePost";

const HomePage = () => {
  return (
    <div>
      <h1>YASM: Yet Another Social Media</h1>
      <WritePost />
      <Feed />
      <div>
        <h3>Features still in development:</h3>
        <ul>
          <li>Comment system</li>
          <li>Mention system</li>
          <li>Notifications</li>
          <li>Push Notifications</li>
          <li>Offline use</li>
          <li>PWA Install</li>
          <li>PWA install prompts</li>
        </ul>
      </div>
    </div>
  );
};

export default HomePage;
