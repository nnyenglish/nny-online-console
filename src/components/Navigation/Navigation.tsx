import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { FirebaseManager } from "../../lib/2/firebase-manager";

import styles from "./Navigation.module.scss";
import icoMenu from "../../assets/images/ico-menu.svg";
import icoClose from "../../assets/images/ico-close.svg";

const firebaseManager = FirebaseManager.getInstance();

const Navigation = () => {
	const [onMenuModal, setOnMenuModal] = useState(false);
	const navigate = useNavigate();
  const onLogOutClick = () => {
    firebaseManager.signOut();
    navigate("/");
  }

	const closeModal = () => {
		setOnMenuModal(false);
	};

	const showModal = () => {
		setOnMenuModal(true);
	};

	const navItems = [
		{ name: "Home", route: "/home", forAdmin: true },
		{ name: "Lecture", route: "/lecture", forAdmin: true },
		{ name: "ClassRoom", route: "/class-room", forAdmin: true },
		{ name: "User", route: "/user", forAdmin: true },
	];

	return (
		<header>
			<div className={styles["header-title"]}>
				<h1>NNY online console</h1>
				<button
					className={`${styles["icon-btn"]} ${styles["btn-menu"]} ${
						onMenuModal ? styles["modal-on"] : ""
					}`}
					type="button"
					onClick={showModal}
				>
					메뉴
					<img src={icoMenu} alt="menu" />
				</button>

				<div className={styles["pc-status"]}>
					<button onClick={onLogOutClick}>
						LOGOUT
					</button>
				</div>
			</div>

			<nav className={styles["pc-nav"]}>
				{navItems.map((item, idx) => (
					<NavLink key={idx} className={({ isActive }) => isActive ? styles["active-nav"] : ""} to={item.route}>{item.name}</NavLink>
				))}
			</nav>

			<div className={`${styles.modal} ${onMenuModal ? styles["modal-on"] : ""}`}>
				<button
					className={`${styles["icon-btn"]} ${styles["btn-close"]}`}
					type="button"
					onClick={closeModal}
				>
					닫기
					<img src={icoClose} alt="close menu" />
				</button>
				<nav className={styles["mobile-nav"]}>
					{navItems.map((item, idx) => (
						<NavLink key={idx} className={({ isActive }) => isActive ? styles["active-nav"] : ""} to={item.route}>{item.name}</NavLink>
					))}
				</nav>
			</div>
		</header>
	);
};

export default Navigation;
