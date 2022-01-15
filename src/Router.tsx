import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Auth from "./pages/Auth/Auth";
import Home from "./pages/Home/Home";
import Lecture from "./pages/Lecture/Lecture";
import User from "./pages/User/User";

import Navigation from "./components/Navigation/Navigation";
import ClassRoom from "./pages/ClassRoom/ClassRoom";

interface IProps {
	isLoggedIn: boolean;
}

const AppRouter = ({ isLoggedIn }: IProps) => {
	return (
		<Router>
			{isLoggedIn && <Navigation />}
			<Routes>
				{isLoggedIn ? (
					<>
						<Route path="/home" element={<Home />} />
						<Route path="/lecture" element={<Lecture />} />
						<Route path="/class-room" element={<ClassRoom />} />
						<Route path="/user" element={<User />} />
						<Route path="/" element={<Navigate replace to="/home" />} />
					</>
				) : (
					<>
						<Route path="/" element={<Auth />} />
					</>
				)}
				<Route path="*" element={<Navigate replace to="/" />} />
			</Routes>
		</Router>
	);
};

export default AppRouter;
