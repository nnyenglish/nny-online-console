import { useEffect, useState } from "react";
import { LectureDoc, UserDoc } from "../../lib/1/schema";
import { FirebaseManager } from "../../lib/2/firebase-manager";

import styles from "./Home.module.scss";

const firebaseManager = FirebaseManager.getInstance();
const userCollectionPath = "user";
const lectureCollectionPath = "lecture";

const Home = () => {
	const [lectureNum, setLectureNum] = useState<number>(0);
	const [userNum, setUserNum] = useState<number>(0);

	useEffect(() => {
		const lectureSubscription = firebaseManager
			.observe<LectureDoc>(lectureCollectionPath, [])
			.subscribe(docs => {
				// docs.filter(doc => doc.deletedAt)
				setLectureNum(docs.length);
			});

		const userSubscription = firebaseManager
			.observe<UserDoc>(userCollectionPath, [])
			.subscribe(docs => {
				const users = docs.filter(doc => !doc.roleAdmin);
				setUserNum(users.length);
			});

		return () => {
			lectureSubscription.unsubscribe();
			userSubscription.unsubscribe();
		};
	}, [])

	return (
		<div className={styles.homeContainer}>
			<section className={styles.sectionHero}>
				<div className={styles.sectionContent}>
					<div className={styles.oneHalf}>
						<h2 className={styles.heroTitle}>NNY Console</h2>
					</div>
					<div className={styles.oneHalf}>
						<p><a className={styles.link} href="https://classnny.web.app/home" target="_blank" rel="noopener noreferrer">classnny</a>의 사용자 및 컨텐츠 관리자 페이지입니다.</p>
					</div>
				</div>
			</section>

			<section className={styles.cards}>
				<div className={styles.card}>
					<h3 className={styles.cardTitle}>가입자</h3>
					<p className={styles.cardValue}>{userNum}</p>
					<p className={styles.cardCaption}>관리자 제외</p>
				</div>
				<div className={styles.card}>
					<h3 className={styles.cardTitle}>총 강의 수</h3>
					<p className={styles.cardValue}>{lectureNum}</p>
					<p className={styles.cardCaption}>삭제된 강의 제외</p>
				</div>
			</section>
		</div>
	)
}
export default Home;
