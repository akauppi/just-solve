# Publish

## Requirements

- `npm` account
   - with 2FA enabled

## Steps

### Build first!

```
$ npm run build
```

### Publish

Check that `package/CHANGELOG.md` contains mention of what the release contains.

```
$ (cd package && npm publish --tag alpha [--dry-run])
...
Enter OTP: ...
+ aside-keys@0.0.1-alpha.1
```

>Hint: You can store your access token by `npm set //<registry>/:_authToken $TOKEN`

>Note: Once stable, remove the `publishConfig.tag` entry from `package.json`.

View [https://www.npmjs.com/package/aside-keys](https://www.npmjs.com/package/aside-keys).

Check you don't have uncommitted files (`git status`); commit them.
 
```
$ git tag 0.0.1-alpha.1		# what you published
$ git push --tags
```

That's it!

