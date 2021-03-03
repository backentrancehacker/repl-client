## Repl Client
Unofficial, promised based Repl Talk client

## Usage
### Installation
```
const ReplClient = require('@adcharity/repl-client')
```

### Initialize the Client
```
const client = new ReplClient.Client()
```

### Log In
You must log into an account to use this package. Some methods, such as searching for a user, do not need a user to login. However, to create posts and comments, you must have a valid repl account.
```
client.login('AdCharity', "#####")
```
### Get user
```
client.details
// => details about yourself

client.getUser(id || 'AdCharity')
// => details about user with id or name
```

### Getting Post
```
// Get post by id
await client.getPost('39898')
// => returns a post and several methods

// Get posts
await client.getPosts({boards, pinned, count, searchQuery, languages}))
// => returns an array of ids
```
### Post Methods
* `.upvote()`: upvotes a post
* `.delete()`: deletes a post (if you can)
* `.comment()`: comments on a post

## Example Code
```
const client = new ReplClient.Client()

client.on('ready', async details => {
	console.log(details)
})

client.login(AdCharityTester, #####)
```