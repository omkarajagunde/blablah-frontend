import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { getStorage, ref, deleteObject } from "firebase/storage";

// Styles!
import styles from "../styles/Blog.module.scss";
import Image from "next/image";

// Images!
import LinkIcon from "../Resources/link.svg";
import EditIcon from "../Resources/edit.svg";
import DeleteIcon from "../Resources/delete.svg";
import { firebase } from "../apiHelpers/firebase";

function ViewBlogs() {
	const [state, setState] = useState({
		blogsLoading: true,
		blogCardsArr: [],
	});

	useEffect(async () => {
		let response = await axios.get(`/api/blog?topics=0`);
		const blogTopics = response.data.data;
		setState((prevState) => ({ ...prevState, blogCardsArr: blogTopics, blogsLoading: false }));
	}, []);

	const getTimeToRead = (text) => {
		return "8 mins";
	};

	const handleBlogDelete = (deleteId, imageUrl) => {
		if (window.confirm("Are you sure you want to delete this Blog?")) {
			const storage = getStorage(firebase);
			// Create a reference to the file to delete
			const imgRef = ref(storage, imageUrl);
			// Delete the file
			deleteObject(imgRef)
				.then((obj) => {
					// File deleted successfully
					console.log("image deleted - ", obj);
					axios.delete(`/api/blog?deleteId=${deleteId}`).then((response) => {
						setState((prevState) => ({ ...prevState, blogCardsArr: state.blogCardsArr.filter((blog) => blog._id !== deleteId) }));
					});
				})
				.catch((error) => {
					// Uh-oh, an error occurred!
					window.alert(error.toString());
					axios.delete(`/api/blog?deleteId=${deleteId}`).then((response) => {
						setState((prevState) => ({ ...prevState, blogCardsArr: state.blogCardsArr.filter((blog) => blog._id !== deleteId) }));
					});
				});
		}
	};

	return (
		<div className={styles.blogHome__fullView}>
			{state.blogsLoading && "Loading... please wait"}
			{!state.blogsLoading && state.blogCardsArr.length === 0 && "No Blogs to show, please add blog, then that come here again!"}
			{!state.blogsLoading &&
				state.blogCardsArr.map((blog) => (
					<div className={styles.blogHome__viewCard}>
						<div className={styles.blogCard} style={{ display: "block" }}>
							<div className={styles.blogCard__image} style={{ width: "100%" }}>
								<img src={blog.blogImage} alt={blog.blogImageAlt || ""} />
							</div>
							<div className={styles.blogCard__text} style={{ width: "100%" }}>
								<div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", borderBottom: "1px solid gray", marginBottom: "10px", marginTop: "10px" }}>
									<div>
										<Link
											href={{
												pathname: "/blog/" + blog.blogSlug,
											}}
										>
											<Image src={LinkIcon.src} alt="go-to-blog" width={25} height={25} />
										</Link>
									</div>
									<div style={{ marginLeft: "10px", marginRight: "10px" }}>
										<Image src={EditIcon.src} alt="go-to-blog" width={25} height={25} />
									</div>
									<div>
										<Image onClick={() => handleBlogDelete(blog._id, blog.blogImage)} src={DeleteIcon.src} alt="go-to-blog" width={25} height={25} />
									</div>
								</div>
								<div className={styles.blogCard__title} style={{ maxWidth: "100%", fontSize: "1rem" }}>
									{blog.blogTitle}
								</div>
								<div className={styles.blogCard__timestamp} style={{ maxWidth: "100%", fontSize: ".7rem" }}>
									<div>{new Date(blog.publishedAt).toDateString()}</div>
									<div>{getTimeToRead(blog.blogHtml)}</div>
								</div>
								<div className={styles.blogCard__subtitle} style={{ maxWidth: "100%", fontSize: ".8rem", WebkitLineClamp: state.isMobileView ? 2 : 3 }}>
									{blog.shortDesc}
								</div>
							</div>
						</div>
					</div>
				))}
		</div>
	);
}

export default ViewBlogs;
