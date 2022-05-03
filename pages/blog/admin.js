import React, { useRef, useState } from "react";
import Footer from "../../components/Footer";
import NavBar from "../../components/NavBar";
import dynamic from "next/dynamic";
import axios from "axios";
import { firebase } from "../../apiHelpers/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Tabs, Tab, Button, Form, Alert } from "react-bootstrap";
import ViewBlogs from "../../components/ViewBlogs";
import admins from "../../Resources/blog-admin-list";
import "suneditor/dist/css/suneditor.min.css";
// Styles!
import styles from "../../styles/Admin.module.scss";
const SunEditor = dynamic(() => import("suneditor-react"), {
	//besure to import dynamically
	ssr: false,
});

const plugins = [
	[
		"undo",
		"redo",
		"fontSize",
		"formatBlock",
		"paragraphStyle",
		"blockquote",
		"bold",
		"underline",
		"italic",
		"strike",
		"subscript",
		"superscript",
		"fontColor",
		"hiliteColor",
		"textStyle",
		"removeFormat",
		"outdent",
		"indent",
		"align",
		"horizontalRule",
		"list",
		"lineHeight",
		"table",
		"link",
		"image",
		"video",
		"fullScreen",
		"showBlocks",
		"codeView",
		"preview",
		/** 'dir', 'dir_ltr', 'dir_rtl' */ // "dir": Toggle text direction, "dir_ltr": Right to Left, "dir_rtl": Left to Right
	],
];

function admin() {
	const editor = useRef();
	const [show, setShow] = useState(true);
	const [state, setState] = useState({
		editorContent: "",
		blogTitle: "",
		blogKeywords: "",
		blogShortDesc: "",
		blogImageFile: null,
		loggedIn: true,
		logInError: null,
		newBlogAdded: false,
	});

	// The sunEditor parameter will be set to the core suneditor instance when this function is called
	const getSunEditorInstance = (sunEditor) => {
		editor.current = sunEditor;
	};

	const handleSave = () => {
		let keywordsArr = state.blogKeywords.split(",");
		keywordsArr.forEach((kwd) => kwd.trim());

		const storage = getStorage(firebase);
		const storageRef = ref(storage, state.blogImageFile.name);

		//'file' comes from the Blob or File API
		uploadBytes(storageRef, state.blogImageFile).then(async (snapshot) => {
			let url = await getDownloadURL(snapshot.ref);
			console.log("Uploaded a blob or file!", snapshot, url);
			let body = {
				blogTitle: state.blogTitle,
				metaKeywords: keywordsArr,
				shortDesc: state.blogShortDesc,
				blogHtml: state.editorContent,
				blogImage: url,
			};
			console.log(state, body);

			axios
				.post(`${process.env.NEXT_PUBLIC_BLABLAH_URL}/api/blog`, body)
				.then((response) => {
					// blog saved successfully
					console.log(response);
					setState((prevState) => ({ ...prevState, newBlogAdded: true }));
					setTimeout(() => {
						window.location.reload();
					}, 1000);
				})
				.catch((err) => {
					// Error saving blog...handle here
				});
		});
	};

	const handleBlogBlur = (event, content) => {
		setState((prevState) => ({ ...prevState, editorContent: content }));
	};

	const handleTitleBlur = (event) => {
		setState((prevState) => ({ ...prevState, blogTitle: event.target.value }));
	};

	const handleMetaKeywordsBlur = (event) => {
		setState((prevState) => ({ ...prevState, blogKeywords: event.target.value }));
	};

	const handleShortDescBlur = (event) => {
		setState((prevState) => ({ ...prevState, blogShortDesc: event.target.value }));
	};

	const handleFileUploadChange = (event) => {
		setState((prevState) => ({ ...prevState, blogImageFile: event.target.files[0] }));
	};

	const handleOnClear = () => {
		setState((prevState) => ({ ...prevState, blogImageFile: null, blogShortDesc: "", blogKeywords: "", blogTitle: "", editorContent: "" }));
		editor.current.setContents("");
	};

	const handleLogin = () => {
		setState((prevState) => ({ ...prevState, loggedIn: false, logInError: null }));
		setShow(false);
		let email = document.getElementById("email");
		let password = document.getElementById("password");
		if (email.value.length > 4 && password.value.length > 4) {
			// make a api call to login the user ...and set loggenIn user as true in state
			admins.forEach((admin) => {
				if (admin.email === email.value.trim() && admin.password === password.value.trim()) {
					setState((prevState) => ({ ...prevState, loggedIn: true, logInError: null }));
				} else {
					// Wrong username password
					setState((prevState) => ({ ...prevState, loggedIn: false, logInError: "Wrong email and/or password provided" }));
					setShow(true);
				}
			});
		} else {
			// Wrong username password
			setState((prevState) => ({ ...prevState, loggedIn: false, logInError: "Enter valid email/password, both should be ateast 4 letters" }));
			setShow(true);
		}
	};

	if (!state.loggedIn) {
		return (
			<>
				<NavBar />

				<div className={styles.adminContainer} style={{ marginBottom: "30px", maxWidth: "400px", padding: "10px", height: "500px" }}>
					{state.logInError && show && (
						<Alert variant="danger" onClose={() => setShow(false)} dismissible>
							<Alert.Heading>Oh error!</Alert.Heading>
							<p>{state.logInError}</p>
						</Alert>
					)}
					<div className={styles.adminContainer__title}>Manage Blog</div>

					<Form.Group className="mb-3">
						<Form.Label>Email address</Form.Label>
						<Form.Control id="email" type="email" placeholder="Enter email" />
						<Form.Text className="text-muted">We'll never share your email with anyone else.</Form.Text>
					</Form.Group>

					<Form.Group className="mb-3">
						<Form.Label>Password</Form.Label>
						<Form.Control id="password" type="password" placeholder="Password" />
					</Form.Group>
					<Button variant="primary" type="submit" onClick={handleLogin}>
						Login
					</Button>
				</div>
			</>
		);
	}

	if (state.loggedIn) {
		return (
			<>
				<NavBar />
				<div className={styles.adminContainer}>
					<div className={styles.adminContainer__title}>Manage Blog</div>
					<Tabs defaultActiveKey="newBlog" id="uncontrolled-tab-example" className="mb-3">
						<Tab eventKey="newBlog" title="New Blog">
							<Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
								<Form.Label>Enter Blog Title</Form.Label>
								<Form.Control maxLength={300} onBlur={handleTitleBlur} placeholder="e.g. This is a catchy blog title which would be 20 -40 words long" />
							</Form.Group>
							<Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
								<Form.Label>Enter Meta keywords (comma seperated ",")</Form.Label>
								<Form.Control maxLength={800} onBlur={handleMetaKeywordsBlur} placeholder="e.g. programming, science, digital marketing" />
							</Form.Group>
							<Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
								<Form.Label>Enter short description</Form.Label>
								<Form.Control
									onBlur={handleShortDescBlur}
									placeholder="e.g. Enter a freeform short 100 - 120 words description that would be shown as a caption of blog"
									as="textarea"
									rows={4}
									maxLength={800}
								/>
							</Form.Group>

							<Form.Group>
								<Form.Label>Image selector</Form.Label>
								<Form.Control onChange={handleFileUploadChange} type="file" accept="image/*" id="captionImage" />
							</Form.Group>
							<div className={styles.adminContainer__newBlogEditor} id="editor">
								<SunEditor
									width="100%"
									value={state.editorContent}
									onBlur={handleBlogBlur}
									getSunEditorInstance={getSunEditorInstance}
									setOptions={{ height: "300px", buttonList: plugins }}
									setDefaultStyle="font-family:'Montserrat', sans-serif"
								/>
							</div>
							<div className={styles.adminContainer__newBlogControls}>
								<Button variant="primary" onClick={handleOnClear}>
									Clear All
								</Button>
								<Button variant="primary" onClick={handleSave}>
									Save Blog
								</Button>
							</div>
							<div className={styles.adminContainer__newBlogAddedAlert}>
								{state.newBlogAdded && (
									<Alert variant="success" onClose={() => setShow(false)} dismissible>
										<Alert.Heading>New Blog added successfully, refreshing window</Alert.Heading>
									</Alert>
								)}
							</div>
						</Tab>
						<Tab eventKey="viewBlog" title="View Blogs">
							<ViewBlogs />
						</Tab>
					</Tabs>
				</div>
				<Footer />
			</>
		);
	}
}

export default admin;
