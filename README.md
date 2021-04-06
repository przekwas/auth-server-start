# Client Authentication and Authorization

The purpose of this lecture series is to teach y'all the _basic_ workflow of how we can "secure" our React applications in the browser. Heavy emphasis on the `""` around the word secure. Why? Because if you have code running in the browser, someone can see what it's doing and potentially exploit it. We leave the heavy work of validation and authorizing to our servers, which we can secure more thoroughly, and take the approach of "expose as little as possible" to our client side code base. The sole premise, which can be extended and grown once you understand it, is that the presence of a stored token will dictate what routes we can view and not view. Even if a token is spoofed into storage, the server will fail to validate it thus leaving our would-be hacker high and dry!

&nbsp;

## Basic Diagram

![Auth Diagram](https://i.imgur.com/e6V1fV0.png)

&nbsp;

## Local Storage vs Cookies

`localStorage` is a way to store data on the client's computer. It allows the saving of key/value pairs in a web browser and it stores data with no expiration date. `localStorage` can only be accessed via JavaScript, and HTML5. However, the user has the ability to clear the browser data/cache to erase all `localStorage` data.

-   known to be vulnerable to Cross Site Scripting (XSS) attacks.

&nbsp;

`cookies` are small files which are located on a user's computer. They are designed to hold a generous amount of data specific to a client and website, and they can accessed either by the web server or the client computer. The reason behind this is to allow the server to deliver a page tailored to a particular user, or the page itself can contain some script which knows of the data in the cookie, and therefore it is able to carry information from one visit to the website to the next. Each cookie is effectively a small lookup table containing pairs of key, data values. Once the cookie has been read by the code on the server or the client computer, the data can be retrieved and used to customize the web the web page appropriately.

-   known to be vulnerable to Cross Site Request Forgery (CSRF) attacks.

&nbsp;

Cookies and local storage serve different purposes. Cookies are mainly for reading server side, whereas local storage can only be read by the client side. Apart from saving data, a big technical difference is the size of data you can store, and as I mentioned earlier `localStorage` gives you more to work with. In conclusion, the question when dealing with the two, one should ask is, in your application who needs this data- the client or the server .. or both!?

&nbsp;

## Why We Use Local Storage

By the title of this heading, you can see we're picking and learning to go with `localStorage` for this particular implementation. Our React applications _do_ need to know some kind of "state" of authentication. Are we logged in or not? As that can have large effects on what pages/routes our users can see or access. We can then take whatever we have in `localStorage` and simply attach it to our fetch requests to get authorized by our server! It's also fairly easy to learn `localStorage`, its size is forgiving and easy to work with, and its API is simple.

&nbsp;

## Local Storage API

```js
// sets a string value of 'The Mandalorian' to the key 'favoriteShow'
// imagine it as a JS object under the hood .. sorta
// { favoriteShow: 'The Mandalorian' } as something to picture!
localStorage.set('favoriteShow', 'The Mandalorian');

// retreives the value 'The Mandalorian' from the key 'favoriteShow'
// show is now a string variable containing our stored value
const show = localStorage.getItem('favoriteShow');

// deletes a single key and value from storage
localStorage.removeItem('favoriteShow');

// full clear of all data in storage
localStorage.clear();
```

&nbsp;

## Fetch Requests with a Token

Adding a token to our request headers is simple! We need to:

-   retreive our token from storage
-   attach it to our fetch request headers as `{ 'Authorization': 'Bearer ' + TOKEN }`

```js
// retreive it from storage
const TOKEN = localStorage.getItem('token');

// make a fetch request to a protected endpoint
fetch('/api/posts', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		// add it to your headers following this syntax
		Authorization: `Bearer ${TOKEN}`
	},
	body: JSON.stringify({ title: 'A New Post!', content: 'This is an example post.' })
});
```

&nbsp;

That's all you need to get going! Simple, eh? But wait! There's more!! One can imagine how tedious this would get having to change _every_ fetch request we have across all our components to use this new property on our request headers. Sounds like a perfect case of solving the problem of Do Not Repeat Yourself (DRY) and making a custom fetching function that will handle it for us consistently. Here's a simple example of such a utility:

```typescript
// example path to file:
// src/client/utils/api-service.ts

export async function apiService<T = any>(uri: string, method: string = 'GET', data?: {}) {
	// retreive token from storage
	const TOKEN = localStorage.getItem('token');
	// prepare a headers object to build
	const headers: HeadersInit = {};
	// prepare out fetch options to build
	const fetchOptions: IFetchOptions = {
		method,
		headers
	};

	// if the token is found, attach it to headers
	// using the Authorization Bearer scheme
	if (TOKEN) {
		headers['Authorization'] = `Bearer ${TOKEN}`;
	}

	// we only need { 'Content-Type': 'application/json' }
	// and { body: JSON.stringify(data) }
	// on POST and PUT methods
	if (method === 'POST' || method === 'PUT') {
		headers['Content-Type'] = 'application/json';
		fetchOptions.body = JSON.stringify(data);
	}

	try {
		// make that fetch like usual
		const res = await fetch(uri, fetchOptions);

		// custom error handling is useful when you're learning
		if (res.status === 400) {
			throw new Error('check fetch options for any errors');
		}

		if (res.status === 401) {
			throw new Error('no token, expired token, or server could not validate token');
		}

		if (res.status === 404) {
			throw new Error('the server endpoint path was not found');
		}

		if (res.status === 500) {
			throw new Error('server blew up, check the terminal logs');
		}

		// only attempt to parse the response json
		// if the fetch gets a good status code e.g. 200/201
		if (res.ok) {
			return <T>await res.json();
		}
	} catch (error) {
		console.error(error);
		// some choices here:
		// throw error to chain up to the next catch block
		// use history object to push a navigate to error page
		throw error;
	}
}

// type to help us build fetch options
interface IFetchOptions {
	method: string;
	headers?: HeadersInit;
	body?: string;
}
```

&nbsp;

And to use the above function in our components, just import it anywhere you'd make a fetch request and that's it:

```jsx
import { apiService } from '../example/utils/api-service.ts';

const Example = (props: ExampleProps) => {
	const handleLogin = async () => {
		try {
			const token = apiService('/auth/login', 'POST', {
				email: 'test@test.com',
				password: 'password123'
			});
			console.log(token);
		} catch (error) {
			// error is already logged from apiService
			// so possibly use history object to navigate to error page?
		}
	};

	return (
		<>
			<button onClick={() => handleLogin()}>I am an example login button lol.</button>
		</>
	);
};

interface ExampleProps {}
```

This `apiService` will always consistently apply our token to the headers, and the `application/json`, when it needs to POST or PUT. It has built in basic error handling already. It streamlines a lot the "business" logic _away_ from our React components, who should typically focus only on what a user sees and interacts with in the browser.

Definitely replace _all_ your basic `fetch` requests with this new utility across your project.

