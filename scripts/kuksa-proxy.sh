#!/bin/bash

username=''
jumpserver=ec2-52-24-204-34.us-west-2.compute.amazonaws.com

if [ -n "$username" ]; then
  jumpserver="$username@$jumpserver"
fi

ssh -f -L 3300:demo.kehatieto.fi:443 -N "$jumpserver"
