// src/pages/RepoLandingPage.jsx
import React, { useState } from "react";
import RepositoryList from "../../components/RepositoryList";
import SearchRepo from "../../components/SearchRepo";

const RepoLandingPage = () => {
  const [selectedRepo, setSelectedRepo] = useState(null);

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-[var(--bg)] pb-1">
      <div className="">
        <SearchRepo onSelectRepo={setSelectedRepo} />
      </div>
      <RepositoryList onSelectRepo={setSelectedRepo} />
    </div>
  );
};

export default RepoLandingPage;
