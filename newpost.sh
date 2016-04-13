#!/bin/bash

if [ $# == 0 ];
then
    name=$(( $(basename $(find content -type f -name '*.md' | awk -F/ '{print $5}' | sort -nr | head -n1) .md) + 1 ))
else
    name=$1
fi;

date=$(date +%Y-%m-%d)
basepath=post/$(date +%Y)/$(date +%m)/$(date +%d)
postpath=content/$basepath
imagepath=static/$basepath/$name

# images
mkdir -p $imagepath

# post
mkdir -p $postpath
echo "---
title: $name
category: unknown
date: $date
---" >> $postpath/$name.md

echo "$postpath/$name.md created"
