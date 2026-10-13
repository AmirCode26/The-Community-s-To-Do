import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Boards from "./pages/Boards";
import Home from "./pages/Home";
import BoardDetail from "./pages/BoardDetail";
import UsersDirectory from "./pages/UsersDirectory";
import UserDetail from "./pages/UserDetail";
import MyCommunity from "./pages/MyComunity";
import AdminPanel from "./pages/Admin";
import AreasDirectory from "./pages/AreasDirectory";
import Logout from "./pages/Logout";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace/>}/>
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/boards" element={<Boards />} />
        <Route path="/boards/:boardId" element={<BoardDetail />} />
        <Route path="/users" element={<UsersDirectory />} />
        <Route path="/users/:userId" element={<UserDetail />} />
        <Route path="/myCommunity" element={<MyCommunity />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/areas" element={<AreasDirectory />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
