import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Articles from "./pages/Article/Articles";
import ArticlesLayout from "./pages/Article/ArticlesLayout";
import Article from "./pages/Article/Article";
import VocabBookLayout from "./pages/VocabBook/VocabBookLayout";
import Home from "./pages/Home/Home";
import NoPage from "./pages/NoPage/NoPage";
import Profile from "./pages/Profile/Profile";
import Review from "./pages/VocabBook/Review/Review";
import VocabBook from "./pages/VocabBook/VocabBook";
import Wordle from "./pages/VocabBook/Wordle/Wordle";
import { KeywordContextProvider } from "./context/keywordContext";
import reportWebVitals from "./reportWebVitals";
import { AuthContextProvider } from "./context/authContext";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <KeywordContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<Home />} />
              <Route path="articles" element={<ArticlesLayout />}>
                <Route index element={<Articles />} />
                <Route path=":articleId" element={<Article />} />
                <Route path="add" element={<Article />} />
              </Route>
              <Route path="vocabbook" element={<VocabBookLayout />}>
                <Route index element={<VocabBook />} />
                <Route path="wordle" element={<Wordle />} />
                <Route path="review" element={<Review />} />
              </Route>
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<NoPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </KeywordContextProvider>
    </AuthContextProvider>
  </React.StrictMode>
);

reportWebVitals();
