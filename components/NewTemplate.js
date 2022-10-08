import React, { useState, useEffect } from "react";
import { Tabs, Tab, Button, Form, Alert, Spinner } from "react-bootstrap";
import _ from "lodash";
import { useDispatch, useSelector } from "react-redux";
import styles from "../styles/Admin.module.scss";
import useUpdateEffect from "./_helpers/useUpdateEffect";
import mongoose from "mongoose";
import { firebase } from "../apiHelpers/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ClearWishes, GetWishesCategories, SaveNewWishTemplate } from "../actions/wishesActions";

const INIT_STATE = {
	category: "",
	title: "",
	slug: "",
	metaKeywords: "",
	metaDescription: "",
	gif: "",
	videoLaptopView: "",
	videoLaptopViewImgSeq: [],
	videoMobileView: "",
	videoMobileViewImgSeq: [],
	image: "",
	errorMessage: "",
	successMessage: "",

	categories: []
};

function NewTemplate() {
	const dispatch = useDispatch();
	const WishesSelector = useSelector((state) => state.wishes, _.isEqual);
	const [state, setState] = useState({
		...INIT_STATE
	});

	useEffect(() => {
		// Get all wishes categories
		dispatch(GetWishesCategories());
	}, []);

	useUpdateEffect(() => {
		if (WishesSelector.wishesCategoriesStatus === 200) {
			dispatch(ClearWishes());
			setState((prevState) => ({ ...prevState, categories: WishesSelector.wishesCategoriesData }));
		}

		if (WishesSelector.wishesCategoriesStatus === 600) {
			dispatch(ClearWishes());
			if (confirm("Please check your internet connection, Click OK to refresh")) window.location.reload();
		}

		if (WishesSelector.saveNewWishTemplateStatus === 200) {
			dispatch(ClearWishes());
			setState((prevState) => ({
				...prevState,
				templateSavedData: WishesSelector.saveNewWishTemplateData,
				templateSaveLoading: false,
				successMessage: "Template saved successfully"
			}));
		}

		if (WishesSelector.saveNewWishTemplateStatus === 600) {
			dispatch(ClearWishes());
			alert("Please check your internet connection");
		}
	}, [WishesSelector]);

	const handleTemplateTitleBlur = (event) => {
		setState((prevState) => ({
			...prevState,
			title: event.target.value.trim()
		}));
	};

	const handleTemplateSlugBlur = (event) => {
		setState((prevState) => ({
			...prevState,
			slug: event.target.value.trim()
		}));
	};

	const convertToSlug = (Text) => {
		return Text.toLowerCase()
			.replace(/ /g, "-")
			.replace(/[^\w-]+/g, "");
	};

	const handleTemplateSlugKeyDown = (event) => {
		let value = document.getElementById("slug-input").value;
		value = convertToSlug(value);
		document.getElementById("slug-input").value = value.toLowerCase();
	};

	const handleMetaKeywordsBlur = (event) => {
		setState((prevState) => ({
			...prevState,
			metaKeywords: event.target.value.trim()
		}));
	};

	const handleMetaDescBlur = (event) => {
		setState((prevState) => ({
			...prevState,
			metaDescription: event.target.value.trim()
		}));
	};

	const handleFileUploadChange = async (event, type) => {
		console.log(event, type);
		if (type === "image") {
			setState((prevState) => ({ ...prevState, image: event.target.files[0] }));
		}

		if (type === "gif") {
			setState((prevState) => ({ ...prevState, gif: event.target.files[0] }));
		}

		if (type === "video-laptop") {
			setState((prevState) => ({ ...prevState, videoLaptopView: event.target.files[0] }));
		}

		if (type === "video-laptop-img-seq") {
			setState((prevState) => ({ ...prevState, videoLaptopViewImgSeq: event.target.files }));
		}

		if (type === "video-mobile") {
			setState((prevState) => ({ ...prevState, videoMobileView: event.target.files[0] }));
		}

		if (type === "video-mobile-img-seq") {
			setState((prevState) => ({ ...prevState, videoMobileViewImgSeq: event.target.files }));
		}
	};

	const handleCategoryChange = (event) => {
		if (event.target.value) setState((prevState) => ({ ...prevState, category: event.target.value }));
	};

	const handleOnClear = () => {
		setState((prevState) => ({
			...INIT_STATE
		}));
	};

	const handleCloseNotification = () => {
		setState((prevState) => ({ ...prevState, templateSaveMessage: "", errorMessage: "", templateSaveLoading: false, successMessage: "" }));
	};

	const handleSave = async () => {
		// Validations check
		const { category, title, slug, metaKeywords, metaDescription, gif, image, videoLaptopView, videoMobileView } = state;
		if (category.length <= 4) {
			setState((prevState) => ({ ...prevState, errorMessage: "Please select a category" }));
			return;
		}

		if (title.length <= 4) {
			setState((prevState) => ({ ...prevState, errorMessage: "title must be greater than equal to 4 letters" }));
			return;
		}

		if (slug.length <= 4) {
			setState((prevState) => ({ ...prevState, errorMessage: "slug must be greater than equal to 4 letters" }));
			return;
		}

		if (metaKeywords.length <= 4) {
			setState((prevState) => ({ ...prevState, errorMessage: "metaKeywords must be greater than equal to 4 letters" }));
			return;
		}

		if (metaDescription.length <= 4) {
			setState((prevState) => ({
				...prevState,
				errorMessage: "metaDescription must be greater than equal to 4 letters"
			}));
			return;
		}

		if (image === "") {
			setState((prevState) => ({
				...prevState,
				errorMessage: "Please upload a template image"
			}));
			return;
		}

		if (gif === "") {
			setState((prevState) => ({
				...prevState,
				errorMessage: "Please upload a template GIF"
			}));
			return;
		}

		if (videoLaptopView === "") {
			setState((prevState) => ({
				...prevState,
				errorMessage: "Please upload a template Video [Laptop view]"
			}));
			return;
		}

		if (videoMobileView === "") {
			setState((prevState) => ({
				...prevState,
				errorMessage: "Please upload a template Video [Mobile view]"
			}));
			return;
		}

		console.log(state);

		let uploadObj = {
			title,
			category,
			slug,
			metaKeywords: metaKeywords.split(","),
			metaDescription,
			mobileImageSeq: [],
			laptopImageSeq: []
		};
		setState((prevState) => ({
			...prevState,
			templateSaveLoading: true,
			templateSaveMessage: "Uploading Template Image..."
		}));
		// 1. Create unique templateId
		let templateId = new mongoose.Types.ObjectId();
		uploadObj._id = templateId.toString();
		const storage = getStorage(firebase);

		try {
			// 2. Upload image by templateId to firebase
			var file_ext = state.image.name.substr(state.image.name.lastIndexOf(".") + 1, state.image.name.length);
			var filePathName = `${templateId}/${templateId}.${file_ext}`;
			var storageTemplateRef = ref(storage, filePathName);
			let resultUpload = await uploadBytes(storageTemplateRef, state.image);
			let url = await getDownloadURL(resultUpload.ref);
			uploadObj.image = url;

			// 3. Upload GIF by templateId to firebase
			setState((prevState) => ({
				...prevState,
				templateSaveLoading: true,
				templateSaveMessage: "Uploading Template GIF..."
			}));
			file_ext = state.gif.name.substr(state.gif.name.lastIndexOf(".") + 1, state.gif.name.length);
			filePathName = `${templateId}/${templateId}.${file_ext}`;
			storageTemplateRef = ref(storage, filePathName);
			resultUpload = await uploadBytes(storageTemplateRef, state.gif);
			url = await getDownloadURL(resultUpload.ref);
			uploadObj.gif = url;

			// 4. Upload Video laptop view by templateId to firebase
			setState((prevState) => ({
				...prevState,
				templateSaveLoading: true,
				templateSaveMessage: "Uploading Template Video [Laptop view]..."
			}));
			file_ext = state.videoLaptopView.name.substr(state.videoLaptopView.name.lastIndexOf(".") + 1, state.videoLaptopView.name.length);
			filePathName = `${templateId}/${templateId}-16-9.${file_ext}`;
			storageTemplateRef = ref(storage, filePathName);
			resultUpload = await uploadBytes(storageTemplateRef, state.videoLaptopView);
			url = await getDownloadURL(resultUpload.ref);
			uploadObj.videoLaptopView = url;

			// 5. Upload Video mobile view by templateId to firebase
			setState((prevState) => ({
				...prevState,
				templateSaveLoading: true,
				templateSaveMessage: "Uploading Template Video [Mobile view]..."
			}));
			file_ext = state.videoMobileView.name.substr(state.videoMobileView.name.lastIndexOf(".") + 1, state.videoMobileView.name.length);
			filePathName = `${templateId}/${templateId}-9-16.${file_ext}`;
			storageTemplateRef = ref(storage, filePathName);
			resultUpload = await uploadBytes(storageTemplateRef, state.videoMobileView);
			url = await getDownloadURL(resultUpload.ref);
			uploadObj.videoMobileView = url;

			if (state.videoLaptopViewImgSeq.length > 0) {
				// Upload Video laptop Image Sequence
				setState((prevState) => ({
					...prevState,
					templateSaveLoading: true,
					templateSaveMessage: "Uploading Laptop view image sequences..."
				}));
				file_ext = state.videoLaptopViewImgSeq[0].name.substr(state.videoLaptopViewImgSeq[0].name.lastIndexOf(".") + 1, state.videoLaptopViewImgSeq[0].name.length);
				let array = Array.from(state.videoLaptopViewImgSeq);
				//let idx = 0;
				let promiseArray = [];
				let resultArray = [];
				array.forEach((img, idx) => {
					filePathName = `${templateId}/16-9/${idx}.${file_ext}`;
					storageTemplateRef = ref(storage, filePathName);
					promiseArray.push(uploadBytes(storageTemplateRef, img));
				});
				console.log("promiseArray arr for laptop img seq - ", promiseArray);
				let resultUpload = await Promise.all(promiseArray);
				resultUpload.forEach((result) => {
					resultArray.push(getDownloadURL(result.ref));
				});
				console.log("resultArray arr for laptop img seq - ", resultArray);
				resultUpload = await Promise.all(resultArray);
				uploadObj.laptopImageSeq = [...resultUpload];
				// for await (let img of array) {
				// 	filePathName = `${templateId}/16-9/${idx}.${file_ext}`;
				// 	storageTemplateRef = ref(storage, filePathName);
				// 	resultUpload = await uploadBytes(storageTemplateRef, img);
				// 	url = await getDownloadURL(resultUpload.ref);
				// 	uploadObj.laptopImageSeq = [...uploadObj.laptopImageSeq, url];
				// 	idx++;
				// }
			}

			if (state.videoMobileViewImgSeq.length > 0) {
				// Upload Video movile Image Sequence
				setState((prevState) => ({
					...prevState,
					templateSaveLoading: true,
					templateSaveMessage: "Uploading Mobile view image sequences..."
				}));
				file_ext = state.videoMobileViewImgSeq[0].name.substr(state.videoMobileViewImgSeq[0].name.lastIndexOf(".") + 1, state.videoMobileViewImgSeq[0].name.length);
				let array = Array.from(state.videoMobileViewImgSeq);
				//let idx = 0;
				let promiseArray = [];
				let resultArray = [];
				array.forEach((img, idx) => {
					filePathName = `${templateId}/9-16/${idx}.${file_ext}`;
					storageTemplateRef = ref(storage, filePathName);
					promiseArray.push(uploadBytes(storageTemplateRef, img));
				});
				console.log("promiseArray arr for mobile img seq - ", promiseArray);
				let resultUpload = await Promise.all(promiseArray);
				resultUpload.forEach((result) => {
					resultArray.push(getDownloadURL(result.ref));
				});
				console.log("resultArray arr for mobile img seq - ", resultArray);
				resultUpload = await Promise.all(resultArray);
				uploadObj.mobileImageSeq = [...resultUpload];
				// let idx = 0;
				// for await (let img of array) {
				// 	filePathName = `${templateId}/9-16/${idx}.${file_ext}`;
				// 	storageTemplateRef = ref(storage, filePathName);
				// 	resultUpload = await uploadBytes(storageTemplateRef, img);
				// 	url = await getDownloadURL(resultUpload.ref);
				// 	uploadObj.mobileImageSeq = [...uploadObj.mobileImageSeq, url];
				// 	idx++;
				// }
			}

			console.log("UploadObj ::: ", uploadObj);

			// 6. Call API to save template
			setState((prevState) => ({
				...prevState,
				templateSaveLoading: true,
				templateSaveMessage: "Saving template details"
			}));

			dispatch(SaveNewWishTemplate(uploadObj));
		} catch (error) {
			console.log("Error -- ", error);
		}
	};

	return (
		<div>
			<Form.Select onChange={handleCategoryChange} aria-label="Default select example" aria-labelledby="Select category">
				<option>Select category *</option>
				{state.categories.map((c) => (
					<option key={c._id} value={c._id}>
						{c.name}
					</option>
				))}
			</Form.Select>
			<br />
			<Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
				<Form.Label>Enter Template Title *</Form.Label>
				<Form.Control maxLength={50} onBlur={handleTemplateTitleBlur} placeholder="e.g. This is a catchy template title which would be 3 -5 words long" />
			</Form.Group>
			<Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
				<Form.Label>Enter Template Slug *</Form.Label>
				<Form.Control
					id="slug-input"
					maxLength={50}
					onBlur={handleTemplateSlugBlur}
					onChange={handleTemplateSlugKeyDown}
					placeholder="e.g. This is a catchy template title which would be 3 -5 words long"
				/>
			</Form.Group>
			<Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
				<Form.Label>Enter Meta keywords (comma seperated ",") *</Form.Label>
				<Form.Control maxLength={800} onBlur={handleMetaKeywordsBlur} placeholder="e.g. programming, science, digital marketing" />
			</Form.Group>
			<Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
				<Form.Label>Enter meta description *</Form.Label>
				<Form.Control
					onBlur={handleMetaDescBlur}
					placeholder="e.g. Enter a freeform short 100 - 120 words description that would be shown as meta tag in browsers"
					as="textarea"
					rows={4}
					maxLength={800}
				/>
			</Form.Group>

			<Form.Group>
				<Form.Label>Template image *</Form.Label>
				<Form.Control onChange={(event) => handleFileUploadChange(event, "image")} type="file" accept="image/*" id="captionImage" />
			</Form.Group>
			<br />
			<Form.Group>
				<Form.Label>Template gif *</Form.Label>
				<Form.Control onChange={(event) => handleFileUploadChange(event, "gif")} type="file" accept="image/gif" id="captionImage" />
			</Form.Group>
			<br />
			<Form.Group>
				<Form.Label>
					Template video <b>[Laptop view 16:9] *</b>
				</Form.Label>
				<Form.Control onChange={(event) => handleFileUploadChange(event, "video-laptop")} type="file" accept="video/*" id="captionImage" />
			</Form.Group>
			<br />
			<Form.Group>
				<Form.Label>
					Template Image sequence <b>[Laptop view 16:9]</b>
				</Form.Label>
				<Form.Control onChange={(event) => handleFileUploadChange(event, "video-laptop-img-seq")} multiple type="file" accept="image/*" id="captionImage" />
			</Form.Group>
			<br />
			<Form.Group>
				<Form.Label>
					Template video <b>[Mobile view 9:16] *</b>
				</Form.Label>
				<Form.Control onChange={(event) => handleFileUploadChange(event, "video-mobile")} type="file" accept="video/*" id="captionImage" />
			</Form.Group>
			<br />
			<Form.Group>
				<Form.Label>
					Template Image sequence <b>[Mobile view 9:16]</b>
				</Form.Label>
				<Form.Control onChange={(event) => handleFileUploadChange(event, "video-mobile-img-seq")} multiple type="file" accept="image/*" id="captionImage" />
			</Form.Group>
			<br />
			<div className={styles.adminContainer__newBlogControls}>
				<Button variant="primary" onClick={handleOnClear}>
					Clear All
				</Button>
				<Button variant="primary" onClick={handleSave}>
					Save template
				</Button>
			</div>
			<br />
			<div className={styles.adminContainer__newBlogAddedAlert}>
				{state.errorMessage !== "" && (
					<Alert variant="danger" onClose={handleCloseNotification} dismissible>
						<Alert.Heading>{state.errorMessage}</Alert.Heading>
					</Alert>
				)}
				{state.templateSaveLoading && (
					<Alert variant="primary" onClose={handleCloseNotification} dismissible style={{ display: "flex" }}>
						<Spinner animation="border" role="status" style={{ marginRight: "10px" }}>
							<span className="visually-hidden">Loading...</span>
						</Spinner>
						<Alert.Heading>{state.templateSaveMessage}</Alert.Heading>
					</Alert>
				)}
				{state.successMessage !== "" && (
					<Alert variant="sucess" onClose={handleCloseNotification} dismissible style={{ display: "flex" }}>
						<Alert.Heading>{state.successMessage}</Alert.Heading>
					</Alert>
				)}
			</div>
		</div>
	);
}

export default NewTemplate;
