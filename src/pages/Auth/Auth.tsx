import { ChangeEvent, FormEvent, useState } from "react";

import { FirebaseManager } from "../../lib/2/firebase-manager";

import styles from "./Auth.module.scss";

const firebaseManager = FirebaseManager.getInstance();

const Auth = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const onChange = (event: ChangeEvent<HTMLInputElement>) => {
		const {
			target: { name, value },
		} = event;
		if (name === "email") {
			setEmail(value);
		} else if (name === "password") {
			setPassword(value);
		}
	};
	// https://firebase.google.com/docs/auth/web/password-auth
	const onSubmit = async (event: FormEvent) => {
		event.preventDefault();
		setIsLoading(true);
		try {
			await firebaseManager.signIn(email, password);
		} catch (error) {
			setError((error as Error).message);
		}
		setIsLoading(false);
	};

	return (
		<div className={styles.authContainer}>
			<h2>로그인</h2>
			<form onSubmit={onSubmit}>
				<input
					name="email"
					type="email"
					placeholder="Email"
					required
					value={email}
					onChange={onChange}
				/>
				<input
					name="password"
					type="password"
					placeholder="Password"
					required
					value={password}
					onChange={onChange}
				/>
				<input
					className={styles.submitBtn}
					type="submit"
					value={isLoading ? "잠시만 기다려주세요" : "로그인"}
					disabled={isLoading}
				/>
				<p className={styles.errorMsg}>{error}</p>
			</form>
		</div>
	);
};

export default Auth;
