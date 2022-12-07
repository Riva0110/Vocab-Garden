import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Articles from "./pages/Article/Articles";
import ArticlesLayout from "./pages/Article/ArticlesLayout";
import Article from "./pages/Article/Article";
import VocabBookLayout from "./pages/VocabBook/VocabBookLayout";
import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import ProfileLayout from "./pages/Profile/ProfileLayout";
import ReviewLayout from "./pages/VocabBook/Review/ReviewLayout";
import Review from "./pages/VocabBook/Review/Review";
import BattleReview from "./pages/VocabBook/Review/BattleReview";
import VocabBook from "./pages/VocabBook/VocabBook";
import { KeywordContextProvider } from "./context/keywordContext";
import { AuthContextProvider } from "./context/authContext";
import { VocabBookContextProvider } from "./context/vocabBookContext";
import { ArticleWords } from "./pages/Article/ArticleWords";
import reportWebVitals from "./reportWebVitals";
import Friends from "./pages/Friends/Friends";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  // <React.StrictMode>
  <AuthContextProvider>
    <KeywordContextProvider>
      <VocabBookContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<Home />} />
              <Route path="articles" element={<ArticlesLayout />}>
                <Route index element={<Articles />} />
                <Route path="words" element={<ArticleWords />} />
                <Route path=":articleId" element={<Article />} />
                <Route path="add" element={<Article />} />
              </Route>
              <Route path="vocabbook" element={<VocabBookLayout />}>
                <Route index element={<VocabBook />} />
                <Route path="review" element={<ReviewLayout />}>
                  <Route index element={<Review />} />
                  <Route path=":pin" element={<BattleReview />} />
                </Route>
              </Route>
              <Route path="profile" element={<ProfileLayout />}>
                <Route index element={<Profile />} />
                <Route path="friends" element={<Friends />} />
              </Route>
              <Route path="*" element={<Home />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </VocabBookContextProvider>
    </KeywordContextProvider>
  </AuthContextProvider>
  // </React.StrictMode>
);

reportWebVitals();
