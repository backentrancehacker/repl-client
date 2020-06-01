## Overview
* This is a simple package to interact with Repl Talk.
* It is promised based, unlike many of the callback based packages.

## Usage
### Initialize the Client
```
const ReplClient = new Client()
```

### Log In
You must log into an account to use this package. Some methods, such as searching for a user, do not need a user to login. However, to create posts and comments, you must have a valid repl account.
```
await ReplClient.login('AdCharity', "#####")
```
### Get user
```
ReplClient.details
// => details about yourself

ReplClient.getUser(id || 'AdCharity')
// => details about user with id or name
```

### Getting Post
```
// Get post by id
await ReplClient.getPost('39898')
// => returns a post and several methods

// Get posts
await ReplClient.getPosts({boards, pinned, count, searchQuery, languages}))
// => returns an array of ids
```
### Post Methods
`.upvote()`: upvotes a post
`.delete()`: deletes a post (if you can)
`.comment()`: comments on a post