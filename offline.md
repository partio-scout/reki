#Our server went offline, what to do
##Step 1
Allow (modify) ACL login for registryUser into
'''json
    {
      "accessType": "EXECUTE",
      "principalType": "ROLE",
      "principalId": "$everyone",
      "permission": "ALLOW",
      "property": "login"
    },
'''
##Step 2
Run 'npm run set-password <email> <password>' for each user
##Step 3
Update ACL modified in step 1 back to its original form.
##Loggin in
User can log in in pathname '/login'.
