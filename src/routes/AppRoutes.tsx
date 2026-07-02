import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import ProgressPage from '../pages/ProgressPage';
import QuestionPage from '../pages/QuestionPage';
import RankingPage from '../pages/RankingPage';
import AppLayout from '../AppLayout';
import LoginPage from '../pages/LoginPage';
import ResultPage from '../pages/ResultPage';


export default function AppRoutes() {

 return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/question" element={<QuestionPage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/result" element={<ResultPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
    </Routes>
  )

}




/*
 return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/progress" element={<ProgressPage />} />
      <Route path="/question" element={<QuestionPage />} />
       <Route path="/ranking" element={<RankingPage />} />
    </Routes>
  );
  */