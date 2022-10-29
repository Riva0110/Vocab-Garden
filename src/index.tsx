import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Article from "./pages/Article/Article";
import Home from "./pages/Home/Home";
import NoPage from "./pages/NoPage/NoPage";
import Profile from "./pages/Profile/Profile";
import Review from "./pages/VocabBook/Review/Review";
import VocabBook from "./pages/VocabBook/VocabBook";
import Wordle from "./pages/VocabBook/Wordle/Wordle";
import { KeywordContextProvider } from "./context/keywordContext";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <KeywordContextProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <App
                onChange={function (
                  e: React.ChangeEventHandler<HTMLInputElement>
                ): void {
                  throw new Error("Function not implemented.");
                }}
                onKeyDown={function (
                  e: React.KeyboardEventHandler<HTMLInputElement>
                ): void {
                  throw new Error("Function not implemented.");
                }}
              />
            }
          >
            <Route index element={<Home />} />
            <Route path="article" element={<Article />} />
            <Route path="vocabbook" element={<VocabBook />} />
            <Route path="wordle" element={<Wordle />} />
            <Route path="review" element={<Review />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<NoPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </KeywordContextProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
