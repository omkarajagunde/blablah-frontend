import Link from "next/link";
import React from "react";
import styles from "../styles/Blog.module.scss";

function BlogCard(props) {
	return (
		<Link
			href={{
				pathname: props.blogUrl,
			}}
		>
			<div className={styles.blogCard}>
				<div className={styles.blogCard__image}>
					<img src={props.imageUrl} alt={props.imageAlt} />
				</div>
				<div className={styles.blogCard__text}>
					<div className={styles.blogCard__title}>{props.title}</div>
					<div className={styles.blogCard__timestamp}>
						<div>{props.publishedText}</div>
						<div>{props.readTime}</div>
					</div>
					<div className={styles.blogCard__subtitle}>{props.subTitle}</div>
				</div>
			</div>
		</Link>
	);
}

export default BlogCard;
