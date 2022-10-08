const admins = [{ email: "ajagundeomkar@gmail.com", password: "viratkoli" }];
const headerTexts = [
	{
		title: "Don't just pass time, Make unforgetable memories",
		ticks: [
			"We don’t save your chat",
			"Safe random chats",
			"Gender detection & filters",
			"Free to use",
			"Full Privacy Controls",
			"Image/Audio sharing"
		],
		buttons: [
			{
				text: "Meet people",
				link: "/live"
			}
		]
	},
	{
		title: "Create immersive digital wishes that people would love!",
		ticks: [
			"Customisation with your branding & images",
			"Build subscriber list on whatsapp",
			"Interactive wishes that convert",
			"Add your links",
			"Deep link your links to open native app"
		],
		buttons: [
			{
				text: "Create wishes",
				link: "/wishes"
			}
		]
	}
];
const navbarJson = [
	{
		link: "/ads",
		title: "Buy Ads",
		hide: false
	},
	{
		link: "/quiz",
		title: "Create Quiz",
		hide: true
	},
	{
		link: "/wishes",
		title: "Create Wishes",
		hide: false
	},
	{
		link: "/live",
		title: "Live Chat",
		hide: false
	},
	{
		link: "/blog",
		title: "Blog",
		hide: false
	}
];

const SEO = {
	blog: {
		metaTitle: "",
		pageTitle: "",
		keywords: "",
		description: ""
	},
	home: {
		metaTitle: "Talk with people all around the world",
		pageTitle: "BlaBla - Meet new people",
		keywords:
			"anonymous random chat app,anonymous random video chat app,random anonymous voice chat,anonymous stranger chat app,best anonymous chat site,chat anonymously,chat anonymously online,anonymous chat with strangers,anonymous chat online,online anonymous chatting,india anonymous chat, festival wishes, diwali greetings, diwali wishes",
		description: "Meet new friends, Create interactive festival/event wishes and share with people"
	},
	live: {
		metaTitle: "Talk with beautiful girls and handsome men",
		pageTitle: "Meet new people",
		keywords:
			"anonymous random chat app,anonymous random video chat app,random anonymous voice chat,anonymous stranger chat app,best anonymous chat site,chat anonymously,chat anonymously online,anonymous chat with strangers,anonymous chat online,online anonymous chatting,india anonymous chat,",
		description:
			"Do you also feel lonely? How many time you wanted to share something but you were afraid of getting judged by others?  start an interesting conversation with, someone Unknown, someone Caring, someone Funny, but someone Real, and someone who won't judge you, Head onto Blablah.app/live and meet new people rightaway"
	},
	wishes: {
		metaTitle: "Create interactive wishes, choose from many templates",
		pageTitle: "Blablah - Free wishes creator",
		keywords: "festival wishes, diwali greetings, diwali wishes, happy diwali images",
		description: "Create immersive and interactive wishes which people will love and can't stop sharing"
	},
	wishPage: {
		metaTitle: "",
		pageTitle: "",
		keywords: "",
		description: ""
	}
};

export { admins, headerTexts, navbarJson, SEO };
