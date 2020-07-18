// Dependency
const fetch = require('node-fetch')
const events = require('events')

// Modules
const ReplException = require('./modules/repl-exception.js')
const headers = require('./modules/headers.js')
const { query, parse } = require('./modules/utils.js')

const emitter = new events.EventEmitter()

class Client {
	constructor() {
		this.details = {}
	}
	on(e, cb) {
		emitter.addListener(e, cb)
	}
    async login(username, password) {
		if(!username || !password) 
			throw new ReplException('Cannot initialize repl-client without credentials.')
	
		let res = await fetch('https://repl.it/login', {
			method: 'POST',
			headers,
			body: JSON.stringify({username, password})
		})
		
		global.cookies = res.headers.raw()['set-cookie'].join(';')
		
		let data = await parse(res)

		if(data['message']) 
			throw new ReplException(data['message'])
	
		let details = ['username', 'email', 'first_name', 'last_name', 'time_created', 'icon', 'karma', 'bio', 'roles', 'id']
		for(let key in data) 
			if(details.includes(key)) 
				this.details[key] = data[key]
		

		emitter.emit('ready', this.details)
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
		if(!title || !body || !board) throw new ReplException('Cannot create a post without a title, body, or target board.')
		else if(!boardMap.hasOwnProperty(board)) throw new ReplException('Invalid board.')
		else {
			return query({
				query: 'mutation createPost($input: CreatePostInput!){createPost(input: $input){post{url}}}',
				variables: {
					input: {
						title,
						body,
						boardId: boardMap[board]
					}
				}
			})
		}
	}
	async getPost(id) {
		if(!id) throw new ReplException('Cannot find post without an id.')
		let json = await query({
			query: 
				`query{
					post(id: ${id}){
						recentComments {
							body, id, user {
								id
							}
						}
						id title url isAuthor isLocked commentCount body isAnnouncement isAnswerable timeCreated canEdit canComment canPin canSetType canReport hasReported isLocked showHosted voteCount canVote hasVoted
					}
				}`
		})
		let relevant = json.post

		relevant.remove = () => {
			return query({
				query: 'mutation remove($id: Int!){remove(id: $id){id}}',
				variables: {
					id: relevant.id
				}
			})
		}
		relevant.upvote = () => {
			return query({
				query: 'mutation createPostVote($postId: Int!){createPostVote(postId: $postId){id}}',
				variables: {
					postId: relevant.id
				}
			})
		}
		relevant.comment = (body) => {
			return query({
				query: "mutation CreateComment($input: CreateCommentInput!){createComment(input: $input){comment{id}}}",
				variables: {
					input: {
						postId: relevant.id,
						body: body
					}
				}
			})
			.then(json => {
				return json.createComment.comment
			})
		}
		return relevant
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
		return query({
			query: "query PostsFeed($order: String, $after: String, $searchQuery: String, $languages: [String!], $count: Int, $boardSlugs: [String!], $pinAnnouncements: Boolean, $pinPinned: Boolean){posts(order: $order, after: $after, searchQuery: $searchQuery, languages: $languages, count: $count, boardSlugs: $boardSlugs, pinAnnouncements: $pinAnnouncements, pinPinned: $pinPinned){items {id timeCreated}}}",
			variables
		})
		.then(json => {
			return json.posts.items || {}
		})
	}
	getUser(id) {
		if(!id) throw new ReplException('Cannot find user without an id/username.')

		if(typeof id == "string")
			query = `query{userByUsername(username: "${id}"){username id url image isHacker isVerified timeCreated fullName displayName}}`
		else 
			query = `query{user(id: ${id}){username id url image isHacker  isVerified timeCreated fullName displayName}}`

		return query({
			query: `query{userByUsername(username: "${id}"){username id url image isHacker  isVerified timeCreated fullName displayName}}`
		})
	}
	async getComment(id) {
		let json = await query({
			query: 
				`query{
					comment(id: ${id}){
						body id canEdit canComment voteCount canVote hasVoted
						user {
							id username
						}
					}
				}`
		})
		let comment = json.comment
		comment.reply = (body) => {
			return query({
				query: `mutation CreateComment($input: CreateCommentInput!){createComment(input: $input){comment{id}}}`,
				variables: {
					input: {
						body,
						commentId: comment.id,
					}
				}
			})
		}
		comment.upvote = () => {
			return query({
				query: 'mutation createCommentVote($commentId: Int!){createCommentVote(commentId: $commentId){id}}',
				variables: {
					commentId: comment.id
				}
			})
		}
		return comment
	}
}

(() => {
	module.exports = {
		Client
	}
}).call(this)