#Our server went offline, what to do
##Step 1
Create ACL for registryUser
'''json
    {
      "accessType": "WRITE",
      "principalType": "ROLE",
      "principalId": "$unauthenticated",
      "permission": "ALLOW",
      "property": "updateAttributes"
    },
'''
##Step 2
Run 'npm run set-password <email> <password>' for each user
##Step 3
Delete ACL created in step 1
##Loggin in
User can log in in pathname '/login'.
