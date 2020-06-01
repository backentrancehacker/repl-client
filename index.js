const fetch = require('node-fetch')

const ReplClientError = require('./manager')

const parseJSON = (res) => res.json()
const parseCookies = (cookies) => {
	return Object.fromEntries(cookies.split(/; */).map(c => {
		const [ key, ...v ] = c.split('=');
		return [ key, decodeURIComponent(v.join('=')) ];
	}));
}


class Client {
	constructor() {
		this.details = {}
		this.cookies
	}
    async login(username, password) {
		if(!username || !password) throw new ReplClientError(100)
	
		let response = await fetch('https://repl.it/login', {
			method: 'POST',
			headers: this.getHeaders(),
			body: JSON.stringify({username, password})
		})
		
		this.cookies = response.headers.raw()['set-cookie'].join(';')
		
		let data = await parseJSON(response)
		if(data['message']) throw new ReplClientError('custom', data['message'])
		let details = ['username', 'email', 'first_name', 'last_name', 'time_created', 'icon', 'karma', 'bio', 'roles', 'id']

		for(let key in data) {
			if(details.includes(key)) this.details[key] = data[key]
		}
		return this.details
	}
	getHeaders() {
		let headers =  {
			'Referrer': 'https://repl.it/',	
			'X-Requested-With': 'node-fetch',
			'Content-Type': 'application/json',
			"Accept-Encoding": "gzip, deflate, br",
    		"Connection": "keep-alive",
			"Origin": 'https://repl.it'
		}
		if(this.cookies) headers['Cookie'] = this.cookies
		return headers
	}
	createPost(title, body, board) {
		const boardMap = {
			'challenge': 16,
			'ask': 6,
			'tutorials': 17,
			'announcements': 14,
			'share': 6,
			'moderator': 21,
			'product': 20 
		}
		if(!title || !body || !board) throw new ReplClientError(101)
		else if(!boardMap.hasOwnProperty(board)) throw new ReplClientError(102, board)
		else {
			fetch('https://repl.it/graphql', {
				method: 'POST',
				headers: this.getHeaders(),
				body: JSON.stringify({
					query: 'mutation createPost($input: CreatePostInput!){createPost(input: $input){post{url}}}',
					variables: {
						input: {
							title,
							body,
							boardId: boardMap[board]
						}
					}
				})
			})
		}
	}
	async getPost(id) {
		if(!id) throw new ReplClientError(103)
		return fetch('https://repl.it/graphql', {
			method: 'POST',
			headers: this.getHeaders(),
			body: JSON.stringify({
				query: `query{post(id: ${id}){id title url isAuthor isLocked commentCount body isAnnouncement isAnswerable timeCreated canEdit canComment canPin canSetType canReport hasReported isLocked showHosted voteCount canVote hasVoted}}`,
			})
		})
		.then(parseJSON)
		.then(json => {
			let relevant = json.data.post
			let id = relevant.id
			
			relevant.remove = () => {
				return fetch('https://repl.it/graphql', {
					method: 'POST',
					headers: this.getHeaders(),
					body: JSON.stringify({
						query: 'mutation remove($id: Int!){remove(id: $id){id}}',
						variables: {
							input: {
								id: id
							}
						}
					})
				}).then(parseJSON)
			}
			relevant.upvote = () => {
				return fetch('https://repl.it/graphql', {
					method: 'POST',
					headers: this.getHeaders(),
					body: JSON.stringify({
						query: 'mutation createPostVote($postId: Int!){createPostVote(postId: $postId){id}}',
						variables: {
							postId: id
						}
					})
				}).then(parseJSON)
			}
			relevant.comment = (body) => {
				return fetch('https://repl.it/graphql', {
					method: 'POST',
					headers: this.getHeaders(),
					body: JSON.stringify({
						query: "mutation CreateComment($input: CreateCommentInput!){createComment(input: $input){comment{id}}}",
						variables: {
							input: {
								postId: id,
								body: body
							}
						}
					})
				})
				.then(parseJSON)
				.then(json => {
					return   json.data.createComment.comment

				})
			}
			
			return relevant
		})
	}
	getPosts({order, boards, pinned, count, searchQuery, languages}) {
		let variables = {
			searchQuery: searchQuery || null,
			order: order || null,
			languages: languages || [],
			boardSlugs: boards || ['all'],
			pinPinned: pinned || false,
			count: count || 1
		}
		return fetch('https://repl.it/graphql', {
			method: 'POST',
			headers: this.getHeaders(),
			body: JSON.stringify({
				query: "query PostsFeed($order: String, $after: String, $searchQuery: String, $languages: [String!], $count: Int, $boardSlugs: [String!], $pinAnnouncements: Boolean, $pinPinned: Boolean){posts(order: $order, after: $after, searchQuery: $searchQuery, languages: $languages, count: $count, boardSlugs: $boardSlugs, pinAnnouncements: $pinAnnouncements, pinPinned: $pinPinned){items {id timeCreated}}}",
				variables
			})
		})
		.then(parseJSON)
		.then(json => {
			return json.data.posts.items || {}
		})
	}
	getUser(id) {
		if(!id) throw new ReplClientError(106)

		if(typeof id == "string")
			query = `query{userByUsername(username: "${id}"){username id url image isHacker isVerified timeCreated fullName displayName}}`
		else 
			query = `query{user(id: ${id}){username id url image isHacker  isVerified timeCreated fullName displayName}}`

		return fetch('https://repl.it/graphql', {
			method: 'POST',
			headers: this.getHeaders(),
			body: JSON.stringify({
				query: `query{userByUsername(username: "${id}"){username id url image isHacker  isVerified timeCreated fullName displayName}}`
			})
		}).then(parseJSON)
	}
}

(() => {
	module.exports = Client
}).call(this)